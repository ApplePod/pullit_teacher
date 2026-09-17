"""
score_english_difficulty.py — 영어 5,737문항 난이도 자동 부여 (OPER-137 / 문제은행 1단계)

배경
  영어 원본 JSONL 은 difficulty 가 전부 null 이라 포털의 "난이도" 필터가 영어에서 통째로 먹통이었다.
  수학은 원본에 basic/normal/advanced 가 이미 있으니 그대로 쓰고, 영어만 여기서 산출한다.

========================= 난이도 산출 공식 =========================
사람이 라벨링한 정답 데이터가 없으므로, "지문을 읽고 푸는 부담"을 대리하는 지표를 섞어
상대 등급(백분위 컷)을 매긴다. 절대 난이도가 아니라 5,737개 안에서의 상대 난이도다.

[1] 문항별 원점수 raw
      raw = 0.22·z(wc) + 0.14·z(sent_len) + 0.16·z(awl) + 0.18·z(long_ratio)
          + 0.10·z(vocab_density) + PRIOR[unit]

    · wc            지문 단어 수. question 블록에서 한국어 발문(prompt)을 뺀 본문
                    (paragraph · box.blocks · table headers/rows)의 영문 토큰 수.
                    읽어야 할 절대량 = 가장 큰 부담 → 가중치 최대(0.22).
    · sent_len      문장당 평균 단어 수. 구문 복잡도(삽입절·수식어) 대리 지표(0.14).
    · awl           단어 평균 철자 수. 어휘 수준 대리 지표(0.16).
    · long_ratio    8글자 이상 토큰 비율. 라틴계 학술어휘 비율 = 희귀어 비율의 대리치.
                    별도 빈도 사전을 들고 다니지 않아도 되고 재현이 쉬워서 채택(0.18).
    · vocab_density 원본 vocabulary(어려운 단어 풀이) 항목 수 / 지문 100단어.
                    출제자가 직접 "이건 어렵다"고 표시한 유일한 신호라 넣되,
                    길이에 비례해 늘어나는 성질이 있어 밀도로 정규화하고 가중치는 낮게(0.10).
    · z(·)          5,737개 전체의 평균·표준편차(모집단)로 표준화. 입력이 같으면 항상 같은 값.

    ── 일부러 뺀 신호 ──
    · recommended_time_sec : 유형(unit)마다 상수다(예: 빈칸 120초, 안내문 70초). 유형 정보와
      완전히 겹쳐서 새로 주는 정보가 0 → PRIOR 에 흡수시키고 별도 항으로 쓰지 않는다.
    · score : 5,693개가 2.0, 44개가 3 으로 사실상 상수라 변별력이 없다.

[2] 유형 보정 PRIOR (z 단위)
    수능 영어에서 유형별 체감 난이도 차이는 지문 길이만으로 설명되지 않는다.
    (예: 안내문은 길어도 대조만 하면 풀리고, 빈칸은 짧아도 논리 재구성이 필요)
    아래 값은 수능/모평 오답률 통설 순서를 ±0.55 z 범위로 눌러 담은 것이다.
      +0.55 빈칸 추론      +0.45 함축 의미 추론   +0.40 요약문 완성
      +0.30 문장 삽입      +0.30 글의 순서        +0.20 무관한 문장
      +0.05 제목 추론       0.00 주제 추론        -0.05 요지 추론
      -0.10 필자의 주장    -0.15 도표 불일치      -0.25 내용 불일치
      -0.35 글의 목적      -0.50 안내문 일치      -0.50 안내문 불일치

[3] 전체 백분위 × 유형 내 백분위 혼합
      final = 0.72 · pct_global(raw) + 0.28 · pct_within_unit(raw)
    전체 백분위만 쓰면 PRIOR 가 센 유형이 통째로 한 등급에 몰린다(문장 삽입 전부 advanced 등).
    유형 내 백분위를 28% 섞어 "어떤 유형이든 그 안에서 쉬운 문항/어려운 문항"이 갈리게 한다.
    28% 는 유형 전멸(한 등급 독식)이 사라지는 최소 수준으로 잡았다.

[4] 등급 컷 — 전체를 final 오름차순 정렬해 하위 25% basic / 다음 45% normal / 상위 30% advanced.
    동점 처리는 problem_code 사전순이라 재실행해도 순서가 흔들리지 않는다.

[5] 유형별 최소 보유 보정 (floor = 유형 문항수의 3%, 최소 1개)
    컷 이후에도 특정 유형에 특정 등급이 거의 없으면(예: 글의 목적의 advanced) 그 유형만 골라
    푸는 선생님에게 필터가 무용지물이 된다. 부족한 등급은 인접 등급에서 가장 가까운 순위의
    문항을 끌어와 floor 까지 채운다. 이동량은 전체의 0.5% 수준이라 전체 분포는 거의 그대로다.

멱등성: 입력 JSONL 이 같으면 결과가 항상 동일하다. DB 반영은 problem_code 매칭 UPDATE 라서
        여러 번 돌려도 같은 값으로 덮어쓸 뿐 행이 늘지 않는다.
        영어 행만 대상이며 수학 문항·다른 컬럼은 건드리지 않는다.
===================================================================
"""
import collections
import glob
import json
import re
import statistics
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _bank_db import SRC, lit, sql_or_die, table  # noqa: E402

PRIOR = {
    "english_2015_3_0_1": 0.55,   # 빈칸 추론
    "english_2015_3_0_3": 0.45,   # 함축 의미 추론
    "english_2015_3_0_2": 0.40,   # 요약문 완성
    "english_2015_2_0_2": 0.30,   # 문장 삽입
    "english_2015_2_0_3": 0.30,   # 글의 순서
    "english_2015_2_0_4": 0.20,   # 무관한 문장
    "english_2015_1_0_2": 0.05,   # 제목 추론
    "english_2015_1_0_1": 0.00,   # 주제 추론
    "english_2015_1_0_3": -0.05,  # 요지 추론
    "english_2015_2_0_1": -0.10,  # 필자의 주장
    "english_2015_4_0_4": -0.15,  # 도표 불일치
    "english_2015_4_0_3": -0.25,  # 내용 불일치
    "english_2015_1_0_4": -0.35,  # 글의 목적
    "english_2015_4_0_1": -0.50,  # 안내문 일치
    "english_2015_4_0_2": -0.50,  # 안내문 불일치
}
WEIGHT = {"wc": 0.22, "sent_len": 0.14, "awl": 0.16, "long_ratio": 0.18, "vocab_density": 0.10}
BLEND_UNIT = 0.28          # 유형 내 백분위 혼합 비율
CUT_BASIC, CUT_NORMAL = 0.25, 0.45
FLOOR_RATIO = 0.03         # 유형별 등급 최소 보유 비율
WORD = re.compile(r"[A-Za-z][A-Za-z'\-]*")


def passage_text(question):
    """한국어 발문(prompt)을 제외한 영문 지문 텍스트만 모은다(box·table 내부 포함)."""
    out = []

    def walk(b):
        t = b.get("type")
        if t == "prompt":
            return
        if t == "box":
            for inner in b.get("blocks") or []:
                walk(inner)
        elif t == "table":
            out.extend(b.get("headers") or [])
            for row in b.get("rows") or []:
                out.extend(str(c) for c in row)
        elif b.get("text"):
            out.append(b["text"])

    for b in question or []:
        walk(b)
    return " ".join(out)


def features():
    items = []
    for path in sorted(glob.glob(f"{SRC}/영어문항_최신본/*.jsonl")):
        for line in open(path):
            line = line.strip()
            if not line:
                continue
            d = json.loads(line)
            text = passage_text(d["question"])
            words = WORD.findall(text)
            wc = len(words) or 1
            sents = [s for s in re.split(r"[.!?]+", text) if WORD.search(s)]
            items.append({
                "code": d["problem_code"],
                "unit": d["unit_code"],
                "wc": float(wc),
                "sent_len": wc / max(1, len(sents)),
                "awl": sum(len(w) for w in words) / wc,
                "long_ratio": sum(1 for w in words if len(w) >= 8) / wc,
                "vocab_density": len(d.get("vocabulary") or []) / wc * 100,
            })
    return items


def score(items):
    stats = {}
    for k in WEIGHT:
        vals = [i[k] for i in items]
        stats[k] = (statistics.mean(vals), statistics.pstdev(vals) or 1.0)
    for i in items:
        i["raw"] = sum(
            WEIGHT[k] * ((i[k] - stats[k][0]) / stats[k][1]) for k in WEIGHT
        ) + PRIOR[i["unit"]]

    key = lambda i: (i["raw"], i["code"])  # noqa: E731  동점은 코드 사전순 → 재현 가능
    n = len(items)
    for rank, i in enumerate(sorted(items, key=key)):
        i["pct_global"] = rank / (n - 1)
    by_unit = collections.defaultdict(list)
    for i in items:
        by_unit[i["unit"]].append(i)
    for group in by_unit.values():
        m = len(group)
        for rank, i in enumerate(sorted(group, key=key)):
            i["pct_unit"] = rank / (m - 1) if m > 1 else 0.5
    for i in items:
        i["final"] = (1 - BLEND_UNIT) * i["pct_global"] + BLEND_UNIT * i["pct_unit"]
    return stats


def assign(items):
    order = sorted(items, key=lambda i: (i["final"], i["code"]))
    n = len(order)
    b, nm = int(round(n * CUT_BASIC)), int(round(n * CUT_NORMAL))
    for rank, i in enumerate(order):
        i["difficulty"] = "basic" if rank < b else ("normal" if rank < b + nm else "advanced")

    # [5] 유형별 최소 보유 보정 — 부족한 등급을 인접 등급의 경계 문항으로 채운다
    moved = 0
    by_unit = collections.defaultdict(list)
    for i in items:
        by_unit[i["unit"]].append(i)
    for unit, group in by_unit.items():
        group.sort(key=lambda i: (i["final"], i["code"]))
        floor = max(1, round(len(group) * FLOOR_RATIO))
        # advanced 부족 → 그 유형에서 가장 어려운 normal 을 위로 올린다
        need = floor - sum(1 for i in group if i["difficulty"] == "advanced")
        for i in reversed(group):
            if need <= 0:
                break
            if i["difficulty"] == "normal":
                i["difficulty"] = "advanced"
                need -= 1
                moved += 1
        # basic 부족 → 그 유형에서 가장 쉬운 normal 을 아래로 내린다
        need = floor - sum(1 for i in group if i["difficulty"] == "basic")
        for i in group:
            if need <= 0:
                break
            if i["difficulty"] == "normal":
                i["difficulty"] = "basic"
                need -= 1
                moved += 1
        # normal 부족 → 경계에 가장 가까운 basic/advanced 를 normal 로 되돌린다
        need = floor - sum(1 for i in group if i["difficulty"] == "normal")
        if need > 0:
            pool = [i for i in group if i["difficulty"] == "basic"][-need:] \
                 + [i for i in group if i["difficulty"] == "advanced"][:need]
            for i in pool[:need]:
                i["difficulty"] = "normal"
                moved += 1
    return moved


def push(items, chunk=800):
    """problem_code 매칭 대량 UPDATE. 영어 행만, difficulty 컬럼만 덮어쓴다."""
    updated = 0
    for s in range(0, len(items), chunk):
        part = items[s:s + chunk]
        values = ",".join(f"({lit(i['code'])},{lit(i['difficulty'])})" for i in part)
        sql_or_die(
            f"update problem p set difficulty = v.d "
            f"from (values {values}) as v(c,d) "
            f"where p.problem_code = v.c and p.subject = 'english';"
        )
        updated += len(part)
        print(f"  [{updated}/{len(items)}] 반영", flush=True)
    return updated


def report(items):
    names = {r["code"]: r["middle_name"] for r in
             sql_or_die("select code, middle_name from unit where subject='english';")}
    per = collections.defaultdict(collections.Counter)
    for i in items:
        per[i["unit"]][i["difficulty"]] += 1
    rows = []
    for unit in sorted(per):
        c = per[unit]
        n = sum(c.values())
        rows.append({
            "unit": unit, "유형": names.get(unit, ""), "n": n,
            "basic": f"{c['basic']} ({c['basic']/n*100:.0f}%)",
            "normal": f"{c['normal']} ({c['normal']/n*100:.0f}%)",
            "advanced": f"{c['advanced']} ({c['advanced']/n*100:.0f}%)",
        })
    total = collections.Counter(i["difficulty"] for i in items)
    n = len(items)
    rows.append({
        "unit": "== 전체 ==", "유형": "", "n": n,
        "basic": f"{total['basic']} ({total['basic']/n*100:.1f}%)",
        "normal": f"{total['normal']} ({total['normal']/n*100:.1f}%)",
        "advanced": f"{total['advanced']} ({total['advanced']/n*100:.1f}%)",
    })
    print("\n[영어 난이도 분포 — 유형별]")
    table(rows, ["unit", "유형", "n", "basic", "normal", "advanced"])


def main():
    items = features()
    print(f"영어 문항 {len(items)}건 특징 추출 완료")
    stats = score(items)
    print("특징 평균/표준편차:", {k: (round(v[0], 3), round(v[1], 3)) for k, v in stats.items()})
    moved = assign(items)
    print(f"유형별 최소 보유 보정으로 이동한 문항: {moved}건")
    if "--dry-run" not in sys.argv:
        push(items)
    report(items)


if __name__ == "__main__":
    main()
