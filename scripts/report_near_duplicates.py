#!/usr/bin/env python3
"""
report_near_duplicates.py — 문제은행 근접 중복 문항 목록(docs/bank/near_duplicates.md) 생성기

problem_link 의 similar 링크 중 유사도가 아주 높은 페어를 모아 사람이 검토할 수 있는 형태로
문서화한다. 문항 행은 읽기만 하고 **아무것도 지우거나 고치지 않는다.**

왜 두 가지 점수를 같이 보여주는가
  build_problem_links.py 의 score 는 수식 안의 숫자를 '#' 한 글자로 뭉갠 뒤 계산한다.
  "같은 틀에 숫자만 바꾼 문항"을 쌍둥이로 묶기 위한 의도적인 설계이지만, 그 부작용으로
  구조만 같고 실제로는 답이 다른 별개 문항도 1.0000 이 나온다.
  그래서 여기서는 숫자를 그대로 둔 char n-gram 코사인(raw)을 따로 계산해 같이 싣는다.
    score 높음 + raw 높음 → 상수까지 같음 = 복붙 중복 의심 (우선 검토 대상)
    score 높음 + raw 낮음 → 같은 틀·다른 숫자 = 정상적인 쌍둥이 (조치 불필요)

출력은 결정적(deterministic)이다. 타임스탬프·실행시각·난수를 넣지 않고 정렬 기준을 모두
고정했으므로, 링크가 그대로면 몇 번을 실행해도 같은 파일이 나온다(diff 가 튀지 않는다).

사용법
    python3 scripts/report_near_duplicates.py              # docs/bank/near_duplicates.md 재생성
    python3 scripts/report_near_duplicates.py --stdout     # 파일을 쓰지 않고 표준출력으로만
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import urllib.request
from collections import Counter

# scripts/__pycache__ 가 생겨 git status 를 더럽히지 않게 한다(.gitignore 에 항목이 없다).
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_problem_links as B  # noqa: E402  (자격증명·텍스트 추출 로직 재사용)

# ── 튜닝 상수 ──────────────────────────────────────────────────────────────
# 링크 점수 하한. build_problem_links.py 의 similar 링크 점수 분포에서 0.99 이상은
# "문장 구조가 사실상 같다" 는 뜻이다. 0.95 까지 내리면 같은 개념의 평범한 유사문항이
# 대거 섞여 들어와 검토 목록으로서 의미가 없어지고, 1.0 으로 올리면 토큰이 하나라도
# 다른 진짜 복붙 중복(영어 지문 한 단어 차이 등)을 놓친다.
LINK_SCORE_MIN = 0.99

# raw(숫자 보존) 유사도 구간. 수학 문항 수백 쌍을 눈으로 확인하며 정한 값이다.
#  - 0.90 이상: 상수·표기까지 거의 그대로 겹친다. 사실상 복붙이므로 먼저 처리한다.
#  - 0.70~0.90: 문장은 같은데 값이 일부 다르다. 사람이 원문을 열어봐야 판단이 된다.
#  - 0.70 미만: 같은 틀에 숫자만 바꾼 정상 쌍둥이. 중복이 아니다.
RAW_DUP_MIN = 0.90
RAW_CHECK_MIN = 0.70

RAW_NGRAM = 4          # raw 유사도용 문자 n-gram 크기
SNIPPET_CHARS = 60     # 문서에 싣는 지문 앞부분 길이
PROJECT_REF = B.PROJECT_REF
OUT_PATH = os.path.join(B.ROOT, "docs", "bank", "near_duplicates.md")


# ── 조회 ──────────────────────────────────────────────────────────────────
def run_sql(sql: str):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": sql}).encode(), method="POST",
        headers={"Authorization": f"Bearer {B.ACCESS_TOKEN}", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=300).read())


def fetch_pairs():
    """양방향 링크이므로 source < target 인 정방향 1건만 가져온다. 정렬까지 DB 에서 고정."""
    return run_sql(f"""
        select l.source_code, l.target_code, l.score::float8 score,
               a.subject::text subject, a.unit_code, a.concept,
               a.difficulty diff_a, b.difficulty diff_b,
               a.question qa, b.question qb
        from problem_link l
        join problem a on a.problem_code = l.source_code
        join problem b on b.problem_code = l.target_code
        where l.kind = 'similar'
          and l.score >= {LINK_SCORE_MIN}
          and l.source_code < l.target_code
        order by l.score desc, l.source_code, l.target_code
    """)


# ── raw(숫자 보존) 유사도 ──────────────────────────────────────────────────
def raw_vector(text: str) -> dict[str, float]:
    """공백만 정규화하고 숫자는 그대로 둔 char n-gram 의 L2 정규화 벡터."""
    flat = " ".join(text.split())
    grams = Counter(flat[i:i + RAW_NGRAM] for i in range(max(len(flat) - RAW_NGRAM + 1, 1)))
    norm = math.sqrt(sum(v * v for v in grams.values())) or 1.0
    return {g: v / norm for g, v in grams.items()}


def cosine(va: dict[str, float], vb: dict[str, float]) -> float:
    if len(va) > len(vb):
        va, vb = vb, va
    return sum(v * vb.get(g, 0.0) for g, v in va.items())


def verdict(raw: float) -> str:
    if raw >= RAW_DUP_MIN:
        return "복붙 중복 의심"
    if raw >= RAW_CHECK_MIN:
        return "확인 필요"
    return "같은 틀·다른 숫자"


# ── 묶기 ──────────────────────────────────────────────────────────────────
def cluster(pairs):
    """서로 연결된 문항들을 union-find 로 한 묶음으로 만든다(3개 이상 중복도 한 덩어리로)."""
    parent: dict[str, str] = {}

    def find(x: str) -> str:
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for p in pairs:
        ra, rb = find(p["source_code"]), find(p["target_code"])
        if ra != rb:
            parent[ra] = rb

    groups: dict[str, list] = {}
    for p in pairs:
        groups.setdefault(find(p["source_code"]), []).append(p)
    return list(groups.values())


# ── 문서 ──────────────────────────────────────────────────────────────────
def escape_cell(s: str) -> str:
    return s.replace("|", "\\|")


def build_markdown(pairs) -> str:
    text = {}
    difficulty = {}
    for p in pairs:
        text.setdefault(p["source_code"], B.extract_text(p["qa"]))
        text.setdefault(p["target_code"], B.extract_text(p["qb"]))
        difficulty.setdefault(p["source_code"], p["diff_a"])
        difficulty.setdefault(p["target_code"], p["diff_b"])

    vecs = {code: raw_vector(t) for code, t in text.items()}
    raw_of = {(p["source_code"], p["target_code"]): cosine(vecs[p["source_code"]], vecs[p["target_code"]])
              for p in pairs}

    groups = cluster(pairs)
    # 묶음 안: 유사도 내림차순 → 코드 오름차순. 묶음끼리: 최고 유사도 내림차순 → 첫 문항 코드.
    for g in groups:
        g.sort(key=lambda p: (-p["score"], p["source_code"], p["target_code"]))
    groups.sort(key=lambda g: (-max(p["score"] for p in g),
                               min(min(p["source_code"], p["target_code"]) for p in g)))

    n_pairs = len(pairs)
    n_items = len(text)
    n_groups = len(groups)
    n_dup = sum(1 for v in raw_of.values() if v >= RAW_DUP_MIN)
    n_check = sum(1 for v in raw_of.values() if RAW_CHECK_MIN <= v < RAW_DUP_MIN)
    n_twinish = n_pairs - n_dup - n_check
    by_subject = Counter(g[0]["subject"] for g in groups)

    def snippet(code: str) -> str:
        flat = " ".join(text.get(code, "").split())
        return flat[:SNIPPET_CHARS] + "…" if len(flat) > SNIPPET_CHARS else flat

    out: list[str] = []
    out.append("# 문제은행 근접 중복 문항 (near-duplicates)")
    out.append("")
    out.append(
        f"`problem_link` 의 `similar` 링크 중 텍스트 유사도(`score`)가 **{LINK_SCORE_MIN} 이상**인 페어를 "
        "모은 목록이다. 유사도는 `scripts/build_problem_links.py` 가 계산한 TF-IDF 코사인(0~1)이고, "
        f"{LINK_SCORE_MIN} 이상이면 문장 구조가 사실상 같다는 뜻이다(내용까지 같은지는 아래 `raw` 열로 가른다). "
        f"현재 **{n_pairs}쌍 / {n_items}문항 / {n_groups}개 묶음**이 해당한다. "
        "이 문항들은 링크 생성 과정에서 만들어진 것이 아니라 **원래 문제은행에 이미 들어 있던 것**이고, "
        "이 문서는 그것을 찾아내 나열하기만 한다. 한쪽을 지울지·남길지·문항을 수정해 구분되게 만들지는 "
        "콘텐츠/사업 판단 영역이라 여기서 결정하지 않으며, **문항 행은 하나도 삭제하지 않았다**. "
        "같은 학생에게 같은 문제를 두 번 내보내는 사고를 막으려면 출제·재출제 로직에서 이 묶음 단위로 "
        "한 개만 고르게 하는 것이 최소 조치다.")
    out.append("")
    out.append(
        "> **주의 — 이 목록은 '중복 확정'이 아니라 '중복 후보'다.** 유사도 계산에서 수식 안의 숫자는 "
        "`#` 한 글자로 뭉뚱그린다(같은 틀·다른 숫자 문항을 쌍둥이로 묶기 위한 의도적인 설계다). "
        "그래서 구조가 같고 상수만 다른 문항도 1.0000 이 나올 수 있다. 예를 들어 `log 20 + log 5` 와 "
        "`log 50 + log 2` 는 점수가 1.0000 이지만 별개 문항이다. 반대로 영어는 숫자를 뭉개지 않아 "
        "1.0000 이면 지문이 거의 그대로 겹친다. **수학 묶음은 반드시 사람이 원문을 열어 확인한 뒤 처리할 것.**")
    out.append("")
    out.append(f"- 기준: `kind = 'similar'` · `score >= {LINK_SCORE_MIN}` (양방향 링크이므로 정방향 1건만 집계)")
    out.append(
        f"- **`raw` 열**: 수식 안 숫자를 그대로 둔 char {RAW_NGRAM}-gram 코사인. `score` 가 높아도 `raw` 가 "
        "낮으면 같은 틀에 숫자만 바꾼 정상적인 쌍둥이 문항이다. 우선 처리 대상은 "
        f"**raw ≥ {RAW_DUP_MIN:.2f} 인 {n_dup}쌍**(상수까지 거의 같음 = 복붙 중복 의심), 그다음이 "
        f"**{RAW_CHECK_MIN:.2f}~{RAW_DUP_MIN:.2f} 인 {n_check}쌍**이다. "
        f"나머지 {n_twinish}쌍은 정상 쌍둥이라 조치가 필요 없다.")
    out.append("- 정렬: 묶음은 최고 유사도 내림차순, 묶음 안 페어도 유사도 내림차순 (결정적 — 같은 입력이면 같은 파일)")
    out.append("- 과목별 묶음 수: " + ", ".join(f"{k} {v}개" for k, v in sorted(by_subject.items())))
    out.append(
        "- 참고: 2026-09-17 자로 수학 `twin` 규칙이 바뀌었다. `cognitive_stage` 는 수학 객관식에만 있는 "
        "필드라 단답형 3,877개는 앞으로도 값이 없는데, 예전에는 이 null 을 불일치로 처리해 단답형이 "
        "twin 을 전혀 얻지 못했다. 지금은 **한쪽이라도 stage 가 null 이면 인지단계를 따지지 않는다**. "
        "그래서 수학 twin 링크 수·커버리지가 이전 실행분(57.5%)보다 크게 늘어난 99.0% 다. "
        "이 문서가 쓰는 `similar` 링크는 그 변경의 영향을 받지 않는다.")
    out.append("- 생성: `python3 scripts/report_near_duplicates.py` (링크는 `build_problem_links.py` 가 만든다)")
    out.append("")

    for i, g in enumerate(groups, 1):
        head = g[0]
        members = sorted({c for p in g for c in (p["source_code"], p["target_code"])})
        title = f"## {i}. {head['subject']} · {head['unit_code']}"
        if head.get("concept"):
            title += f" · {head['concept']}"
        title += f" — {len(members)}문항 / {len(g)}쌍 (최고 {head['score']:.4f})"
        out.append(title)
        out.append("")
        out.append("| score | raw | 판정 | A | B |")
        out.append("|---|---|---|---|---|")
        for p in g:
            raw = raw_of[(p["source_code"], p["target_code"])]
            out.append(f"| {p['score']:.4f} | {raw:.4f} | {verdict(raw)} | "
                       f"`{p['source_code']}` | `{p['target_code']}` |")
        out.append("")
        out.append("| 문항 | 난이도 | 지문 앞부분 |")
        out.append("|---|---|---|")
        for code in members:
            out.append(f"| `{code}` | {difficulty.get(code) or '-'} | {escape_cell(snippet(code))} |")
        out.append("")

    return "\n".join(out) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stdout", action="store_true", help="파일을 쓰지 않고 표준출력으로만 출력")
    args = ap.parse_args()

    pairs = fetch_pairs()
    doc = build_markdown(pairs)
    if args.stdout:
        try:
            sys.stdout.write(doc)
        except BrokenPipeError:
            pass  # `| head` 처럼 받는 쪽이 먼저 닫는 경우
        return 0
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        fh.write(doc)
    groups = doc.count("\n## ")
    print(f"wrote {OUT_PATH} — {groups}개 묶음 / {len(pairs)}쌍")
    return 0


if __name__ == "__main__":
    sys.exit(main())
