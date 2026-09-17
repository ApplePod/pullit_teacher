#!/usr/bin/env python3
"""
build_problem_links.py — 쌍둥이/유사유형 문항 관계(problem_link) 생성기

메타수학의 간판 기능인 "쌍둥이 문제 / 유사유형" 을 우리 문항 데이터만으로 만든다.

  규칙(rule) 으로 후보를 좁히고, 텍스트 유사도(TF-IDF 코사인) 로 순위를 매긴다.

  후보 풀(bucket)
    - 1차: 같은 subject + 같은 개념(problem.concept 텍스트 → 없으면 concept_id → 없으면 unit_code)
    - 2차(폴백): 1차에서 similar 를 하나도 못 얻은 문항만 같은 unit_code 안에서 다시 찾는다.
                 twin/step_up/step_down 은 "같은 개념" 이 정의에 들어가므로 폴백하지 않는다.
    - 영어는 concept 텍스트가 없고 concept_id 가 단원(문항 유형)과 1:1 이라 결과적으로 단원 버킷

  kind
    twin       수학: 같은 개념 + 같은 난이도 + 같은 인지단계
                     (단, cognitive_stage 는 객관식에만 있는 필드라 한쪽이라도 null 이면 안 따진다)
               영어: 같은 단원(유형) + 같은 난이도
    similar    같은 개념(영어는 같은 단원), 난이도 무관
    step_up    같은 개념 + 난이도 한 단계 위   (basic < normal < advanced)
    step_down  같은 개념 + 난이도 한 단계 아래

  - (source, kind) 당 최대 8개, score 에 코사인 유사도(0~1) 저장
  - 임계값 미만 페어는 버림 (--threshold, 기본값은 THRESHOLD 참고)
  - 멱등(idempotent): 이번 실행의 created_at 을 모든 행에 심고, 성공 후
    "이번 실행보다 오래된 행" 을 해당 subject 범위에서 지운다 → 전체 재빌드와 동일

의존성: 표준 라이브러리 + numpy/scipy (이미 설치되어 있는 것만 사용)

사용법
    python3 scripts/build_problem_links.py --calibrate          # 유사도 분포만 출력
    python3 scripts/build_problem_links.py --dry-run            # 계산만, DB 미기록
    python3 scripts/build_problem_links.py                      # 전체 재빌드
    python3 scripts/build_problem_links.py --subject math       # 과목 한정
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict

import numpy as np
from scipy import sparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT, ".env.local")
PROJECT_REF = "afjdebkhukhhlpzbtxzu"

# ── 튜닝 상수 ──────────────────────────────────────────────────────────────
MAX_PER_KIND = 8                      # (source, kind) 당 최대 링크 수
# 과목별 코사인 유사도 하한.
#  수학은 같은 개념 안에서 문항이 서로 매우 닮아(top1 유사도 중앙값 0.82) 임계값을 올려도
#  커버리지가 거의 떨어지지 않는다(twin 0.15→0.30 에서 58.9%→57.4%). 대신 0.2 미만 구간에는
#  "같은 개념이지만 실제로는 다른 문제"(예: 미분계수 정의 vs 미분가능성)가 섞여 있어 0.30 으로 잘랐다.
#  영어는 지문 주제가 제각각이라 유사도 스케일 자체가 낮다(top1 중앙값 0.29). 게다가 영어는
#  concept(=unit)이 곧 문항 유형(빈칸 추론·글의 순서 …)이라 "같은 유형 + 같은 난이도" 라는
#  규칙 자체가 이미 강한 보증이고 텍스트 유사도는 순위 매기기용이다. 그래서 0.15 로 낮게 잡았다
#  (twin 커버리지 98.5% / similar 99.6%; 0.20 이면 87.6% / 94.0%, 0.25 면 74% 로 급락).
THRESHOLD = {
    "math": {"twin": 0.30, "similar": 0.30, "step_up": 0.30, "step_down": 0.30},
    "english": {"twin": 0.15, "similar": 0.15, "step_up": 0.15, "step_down": 0.15},
}
KINDS = ("twin", "similar", "step_up", "step_down")
DIFF_ORDER = {"basic": 0, "normal": 1, "advanced": 2}
WRITE_BATCH = 1000
MAX_TEXT_CHARS = 4000                 # 영어 지문이 매우 긴 경우 방어적으로 자름


# ── env / http ────────────────────────────────────────────────────────────
def load_env() -> dict:
    env = {}
    with open(ENV_PATH, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = load_env()
SUPA_URL = ENV["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE_KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]
ACCESS_TOKEN = ENV.get("SUPABASE_ACCESS_TOKEN", "")


def _request(req: urllib.request.Request, tries: int = 4, timeout: int = 180) -> bytes:
    last = ""
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")[:500]
            last = f"HTTP {exc.code}: {body}"
            if exc.code < 500 and exc.code != 429:
                raise RuntimeError(last) from None
        except Exception as exc:  # noqa: BLE001
            last = f"{type(exc).__name__}: {exc}"
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"요청 실패({tries}회): {last}")


def rest(path: str, method: str = "GET", body=None, headers=None, timeout: int = 180) -> bytes:
    hdr = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    hdr.update(headers or {})
    data = json.dumps(body).encode() if body is not None else None
    return _request(urllib.request.Request(f"{SUPA_URL}/rest/v1/{path}", data=data, method=method, headers=hdr),
                    timeout=timeout)


def run_sql(query: str):
    if not ACCESS_TOKEN:
        raise RuntimeError("SUPABASE_ACCESS_TOKEN 이 없어 SQL 을 실행할 수 없습니다.")
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": query}).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"},
    )
    return json.loads(_request(req))


# ── 문항 로드 ──────────────────────────────────────────────────────────────
PROBLEM_COLS = "problem_code,subject,unit_code,concept,concept_id,difficulty,cognitive_stage,question"


def fetch_problems(subject: str) -> list[dict]:
    rows, page, size = [], 0, 1000
    while True:
        lo, hi = page * size, page * size + size - 1
        chunk = json.loads(rest(
            f"problem?select={PROBLEM_COLS}&subject=eq.{subject}&order=problem_code",
            headers={"Range-Unit": "items", "Range": f"{lo}-{hi}"},
        ))
        rows.extend(chunk)
        if len(chunk) < size:
            break
        page += 1
    return rows


# ── 텍스트 정규화 / 토큰화 ─────────────────────────────────────────────────
_CMD_ALIAS = {"dfrac": "frac", "tfrac": "frac", "cfrac": "frac",
              "displaystyle": "", "textstyle": "", "left": "", "right": "",
              "mathrm": "", "mathbf": "", "text": "", "textrm": "", "mbox": "",
              "limits": "", "nolimits": "", "quad": "", "qquad": "", ",": "", ";": "", "!": ""}
_MATH_SPAN = re.compile(r"\$[^$]*\$")
_CMD = re.compile(r"\\([a-zA-Z]+)")
_NUM = re.compile(r"\d+(?:\.\d+)?")
_ASCII_WORD = re.compile(r"[a-zA-Z][a-zA-Z'-]{1,}")
_HANGUL_RUN = re.compile(r"[가-힣]+")
_OPS = set("=+-<>≤≥≠×÷/^_")


def extract_text(question) -> str:
    """question jsonb(블록 배열, box 안에 blocks 중첩) → 평문."""
    out: list[str] = []

    def walk(node):
        if isinstance(node, list):
            for item in node:
                walk(item)
        elif isinstance(node, dict):
            txt = node.get("text")
            if isinstance(txt, str):
                out.append(txt)
            for key in ("blocks", "items", "rows", "cells"):
                if key in node:
                    walk(node[key])
        elif isinstance(node, str):
            out.append(node)

    walk(question)
    return "\n".join(out)[:MAX_TEXT_CHARS]


def math_tokens(body: str) -> list[str]:
    """LaTeX 수식 → 잡음(중괄호·스페이싱 명령·구체적 숫자)을 걷어낸 구조 토큰."""
    seq: list[str] = []
    i, n = 0, len(body)
    while i < n:
        ch = body[i]
        if ch == "\\":
            m = _CMD.match(body, i)
            if m:
                name = _CMD_ALIAS.get(m.group(1), m.group(1))
                if name:
                    seq.append("m:" + name)
                i = m.end()
                continue
            i += 2
            continue
        if ch.isdigit():
            m = _NUM.match(body, i)
            seq.append("m:#")
            i = m.end()
            continue
        if ch.isalpha():
            seq.append("m:v" + ch.lower())
            i += 1
            continue
        if ch in _OPS:
            seq.append("m:o" + ch)
            i += 1
            continue
        i += 1  # 중괄호/괄호/공백 등은 버린다
    # 구조를 담기 위한 인접 바이그램
    grams = [f"m2:{a}|{b}" for a, b in zip(seq, seq[1:])]
    return seq + grams


def plain_tokens(text: str) -> list[str]:
    toks = ["w:" + w.lower() for w in _ASCII_WORD.findall(text)]
    for run in _HANGUL_RUN.findall(text):
        if len(run) == 1:
            toks.append("k:" + run)
            continue
        toks.extend("k:" + run[i:i + 2] for i in range(len(run) - 1))
        toks.extend("k:" + run[i:i + 3] for i in range(len(run) - 2))
    return toks


def tokenize(text: str) -> list[str]:
    toks: list[str] = []
    pos = 0
    for m in _MATH_SPAN.finditer(text):
        toks.extend(plain_tokens(text[pos:m.start()]))
        toks.extend(math_tokens(m.group(0)[1:-1]))
        pos = m.end()
    toks.extend(plain_tokens(text[pos:]))
    return toks


def build_matrix(docs: list[list[str]]) -> sparse.csr_matrix:
    """sublinear TF × smoothed IDF, L2 정규화된 CSR 행렬."""
    df: Counter = Counter()
    counted = []
    for toks in docs:
        tf = Counter(toks)
        counted.append(tf)
        df.update(tf.keys())
    n_docs = len(docs)
    # 전 문서에 등장하거나(=변별력 0) 1개 문서에만 등장하는 토큰은 버린다
    vocab = {t: i for i, t in enumerate((t for t, c in df.items() if 2 <= c < n_docs))}
    idf = np.zeros(len(vocab), dtype=np.float32)
    for tok, idx in vocab.items():
        idf[idx] = math.log((n_docs + 1) / (df[tok] + 1)) + 1.0

    indptr, indices, data = [0], [], []
    for tf in counted:
        for tok, cnt in tf.items():
            idx = vocab.get(tok)
            if idx is None:
                continue
            indices.append(idx)
            data.append((1.0 + math.log(cnt)) * idf[idx])
        indptr.append(len(indices))
    mat = sparse.csr_matrix(
        (np.asarray(data, dtype=np.float32), np.asarray(indices, dtype=np.int32), np.asarray(indptr, dtype=np.int64)),
        shape=(n_docs, max(len(vocab), 1)),
    )
    norms = np.sqrt(mat.multiply(mat).sum(axis=1)).A.ravel()
    norms[norms == 0] = 1.0
    return sparse.diags(1.0 / norms).dot(mat).tocsr().astype(np.float32)


# ── 버킷 ──────────────────────────────────────────────────────────────────
def bucket_key(row: dict) -> tuple[str, str]:
    """같은 개념(없으면 같은 단원) 으로 후보 풀을 만든다.

    concept(자유 텍스트) 를 concept_id 보다 먼저 쓰는 이유: 수학 단답형 문항은 concept 텍스트만
    있고 concept_id 는 아직 비어 있는 과도기라, id 를 우선하면 같은 개념이 두 버킷으로 쪼개진다.
    concept 테이블의 name 은 problem.concept 와 1:1 로 일치하는 것을 확인했다(불일치 0건).
    """
    concept = (row.get("concept") or "").strip()
    if concept:
        return ("concept", concept)
    if row.get("concept_id"):
        return ("concept_id", str(row["concept_id"]))
    return ("unit", row.get("unit_code") or "")


def kind_masks(rows: list[dict], subject: str, bucket_kind: str):
    """버킷 안에서 kind 별로 "이 (source, target) 페어가 규칙을 만족하는가" 를 N×N bool 로 만든다.

    난이도·인지단계가 아직 비어 있는 문항(수학 단답형의 cognitive_stage 등)은 twin/step 후보에서
    자동으로 빠진다. 해당 컬럼이 채워진 뒤 재실행하면 그때 링크가 생긴다.
    """
    n = len(rows)
    diff = np.array([DIFF_ORDER.get(r.get("difficulty") or "", -1) for r in rows], dtype=np.int8)
    stages = {s: i for i, s in enumerate(sorted({r.get("cognitive_stage") or "" for r in rows}))}
    stage = np.array([stages[r.get("cognitive_stage") or ""] for r in rows], dtype=np.int32)
    has_diff = diff >= 0

    same_diff = (diff[:, None] == diff[None, :]) & has_diff[:, None] & has_diff[None, :]
    masks: dict[str, np.ndarray] = {}

    if subject == "math":
        has_stage = np.array([bool(r.get("cognitive_stage")) for r in rows])
        # cognitive_stage 는 수학 객관식에만 있는 필드다. 단답형 3,877개는 원본 JSONL 에 아예 없어서
        # 앞으로도 채워지지 않는다. 그래서 "양쪽 다 값이 있을 때만 같아야 한다"(한쪽이라도 null 이면
        # 인지단계는 따지지 않는다)로 둔다. null 을 불일치로 보면 단답형이 영원히 twin 을 못 얻는다.
        stage_ok = (stage[:, None] == stage[None, :]) | ~has_stage[:, None] | ~has_stage[None, :]
        # 수학 twin 은 개념 버킷 안에서만 의미가 있다(단원 폴백 버킷은 개념이 섞여 있음)
        masks["twin"] = same_diff & stage_ok if bucket_kind != "unit" else np.zeros((n, n), dtype=bool)
    else:
        # 영어는 concept 이 없어 버킷 자체가 단원(유형) → 같은 단원 + 같은 난이도
        masks["twin"] = same_diff

    masks["similar"] = np.ones((n, n), dtype=bool)
    delta = diff[None, :].astype(np.int16) - diff[:, None].astype(np.int16)
    both = has_diff[:, None] & has_diff[None, :]
    masks["step_up"] = (delta == 1) & both
    masks["step_down"] = (delta == -1) & both
    return masks


# ── 생성 ──────────────────────────────────────────────────────────────────
def _bucket_links(rows, idxs, mat, subject, bucket_kind, thresholds, only, seen, links, top1):
    """버킷 하나에서 kind 별 상위 링크를 뽑아 links 에 추가하고 만든 개수를 돌려준다."""
    n = len(idxs)
    if n < 2:
        return 0
    sub = mat[idxs]
    sim = np.clip(np.asarray((sub @ sub.T).todense(), dtype=np.float32), -1.0, 1.0)
    np.fill_diagonal(sim, -1.0)
    if top1 is not None:
        top1.extend(sim.max(axis=1).tolist())

    brows = [rows[i] for i in idxs]
    masks = kind_masks(brows, subject, bucket_kind)
    take = min(MAX_PER_KIND, n - 1)
    made = 0
    for kind in KINDS:
        if only is not None and kind not in only:
            continue
        thr = thresholds[kind]
        scored = np.where(masks[kind], sim, -1.0)
        order = np.argpartition(-scored, take - 1, axis=1)[:, :take]
        for si in range(n):
            src = brows[si]["problem_code"]
            if only is not None and (kind, src) not in only[kind]:
                continue
            cand = order[si]
            cand = cand[scored[si, cand] >= thr]
            if cand.size == 0:
                continue
            cand = cand[np.argsort(-scored[si, cand])]
            for ti in cand:
                key = (src, brows[ti]["problem_code"], kind)
                if key in seen:
                    continue
                seen.add(key)
                links.append((src, brows[ti]["problem_code"], kind, round(float(sim[si, ti]), 4)))
                made += 1
    return made


def generate(rows: list[dict], subject: str, thresholds: dict, calibrate: bool = False):
    docs_text = [extract_text(r.get("question")) for r in rows]
    docs = [tokenize(t) for t in docs_text]
    mat = build_matrix(docs)

    buckets: dict[tuple[str, str], list[int]] = defaultdict(list)
    for i, row in enumerate(rows):
        buckets[bucket_key(row)].append(i)

    links: list[tuple[str, str, str, float]] = []
    seen: set[tuple[str, str, str]] = set()
    top1: list[float] = []
    bucket_report = []

    # 1차: 개념(concept) 버킷
    for key, idxs in sorted(buckets.items()):
        if len(idxs) < 2:
            bucket_report.append((key, len(idxs), 0, "후보 문항이 1개뿐"))
            continue
        made = _bucket_links(rows, idxs, mat, subject, key[0], thresholds, None, seen, links, top1)
        bucket_report.append((key, len(idxs), made, "" if made else "임계값을 넘는 페어 없음"))

    # 2차(폴백): 개념 버킷에서 similar 를 한 개도 못 얻은 문항만 같은 unit_code 안에서 다시 찾는다.
    #  twin/step_up/step_down 은 정의상 "같은 개념" 이 전제라 폴백하지 않는다.
    got_similar = {s for s, _, k, _ in links if k == "similar"}
    missing = {r["problem_code"] for r in rows if r["problem_code"] not in got_similar}
    if missing:
        only = {"similar": {("similar", c) for c in missing}}
        unit_buckets: dict[str, list[int]] = defaultdict(list)
        for i, row in enumerate(rows):
            unit_buckets[row.get("unit_code") or ""].append(i)
        for unit, idxs in sorted(unit_buckets.items()):
            if len(idxs) < 2 or not any(rows[i]["problem_code"] in missing for i in idxs):
                continue
            made = _bucket_links(rows, idxs, mat, subject, "unit", thresholds, only, seen, links, None)
            if made:
                bucket_report.append((("unit-fallback", unit), len(idxs), made, ""))

    if calibrate and top1:
        arr = np.array(top1)
        pct = [5, 10, 25, 50, 75, 90, 95]
        print(f"[calibrate:{subject}] top1 유사도 분포 n={arr.size} "
              + " ".join(f"p{p}={np.percentile(arr, p):.3f}" for p in pct))
    return links, docs_text, bucket_report


# ── 기록 ──────────────────────────────────────────────────────────────────
def write_links(links, run_ts: str) -> int:
    seen = set()
    payload = []
    for src, tgt, kind, score in links:
        key = (src, tgt, kind)
        if key in seen:
            continue
        seen.add(key)
        payload.append({"source_code": src, "target_code": tgt, "kind": kind,
                        "score": min(score, 1.0), "created_at": run_ts})
    for i in range(0, len(payload), WRITE_BATCH):
        rest("problem_link", method="POST", body=payload[i:i + WRITE_BATCH],
             headers={"Prefer": "resolution=merge-duplicates,return=minimal"})
    return len(payload)


def prune(subject: str, run_ts: str) -> None:
    run_sql(
        "delete from problem_link pl using problem p "
        f"where p.problem_code = pl.source_code and p.subject = '{subject}' "
        f"and pl.created_at < '{run_ts}'::timestamptz;"
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--subject", choices=["math", "english", "all"], default="all")
    ap.add_argument("--dry-run", action="store_true", help="계산만 하고 DB 에 쓰지 않는다")
    ap.add_argument("--calibrate", action="store_true", help="유사도 분포만 출력하고 종료")
    ap.add_argument("--no-prune", action="store_true", help="이전 실행 잔여 링크를 지우지 않는다")
    ap.add_argument("--threshold", type=float, default=None, help="모든 kind 의 임계값을 덮어쓴다")
    ap.add_argument("--samples", type=int, default=0, help="샘플 페어 N개를 본문과 함께 출력")
    ap.add_argument("--sample-kind", choices=list(KINDS), default="twin", help="샘플로 뽑을 kind")
    args = ap.parse_args()

    subjects = ["math", "english"] if args.subject == "all" else [args.subject]
    run_ts = dt.datetime.now(dt.timezone.utc).isoformat()
    grand = Counter()
    t0 = time.time()

    for subject in subjects:
        t1 = time.time()
        thresholds = dict(THRESHOLD[subject])
        if args.threshold is not None:
            thresholds = {k: args.threshold for k in thresholds}
        rows = fetch_problems(subject)
        print(f"[{subject}] 문항 {len(rows)}건 로드 ({time.time() - t1:.1f}s) 임계값={thresholds}", flush=True)

        links, texts, breport = generate(rows, subject, thresholds, calibrate=args.calibrate or args.dry_run)
        by_kind = Counter(k for _, _, k, _ in links)
        src_by_kind = defaultdict(set)
        for s, _, k, _ in links:
            src_by_kind[k].add(s)
        n_rows = max(len(rows), 1)
        print(f"[{subject}] 링크 {len(links)}건 "
              + " ".join(f"{k}={by_kind[k]}(src {len(src_by_kind[k])}, {len(src_by_kind[k]) / n_rows * 100:.1f}%)"
                         for k in KINDS)
              + f" ({time.time() - t1:.1f}s)", flush=True)
        empty = [(k, n, why) for k, n, made, why in breport if made == 0]
        if empty:
            print(f"[{subject}] 링크 0건 버킷 {len(empty)}개 / 전체 {len(breport)}개: "
                  + "; ".join(f"{k[1]}(n={n}) {why}" for k, n, why in empty[:15]), flush=True)

        linked = {s for s, _, _, _ in links}
        orphan = [r for r in rows if r["problem_code"] not in linked]
        if orphan:
            per_bucket = Counter(bucket_key(r)[1] for r in orphan)
            print(f"[{subject}] 링크가 하나도 없는 문항 {len(orphan)}건 "
                  f"({len(orphan) / n_rows * 100:.1f}%) 상위 버킷: {per_bucket.most_common(10)}", flush=True)

        if args.samples:
            code_to_text = {r["problem_code"]: texts[i] for i, r in enumerate(rows)}
            kind_pref = args.sample_kind
            pool = sorted((l for l in links if l[2] == kind_pref), key=lambda l: l[3], reverse=True)
            step = max(len(pool) // max(args.samples, 1), 1)
            picks = pool[::step][: args.samples]
            for src, tgt, kind, score in picks:
                print(f"\n--- {kind} {score:.3f} {src} ↔ {tgt}")
                print("  A:", code_to_text.get(src, "")[:260].replace("\n", " "))
                print("  B:", code_to_text.get(tgt, "")[:260].replace("\n", " "))

        grand.update(by_kind)
        if args.calibrate or args.dry_run:
            continue
        written = write_links(links, run_ts)
        print(f"[{subject}] DB 기록 {written}건", flush=True)
        if not args.no_prune:
            prune(subject, run_ts)
            print(f"[{subject}] 이전 실행 잔여 링크 정리 완료", flush=True)

    print(f"DONE {dict(grand)} total={sum(grand.values())} elapsed={time.time() - t0:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
