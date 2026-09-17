"""
load_short_answer.py — 수학 단답형(short_answer) 3,877문항 적재 (OPER-137 / 문제은행 1단계)

배경
  최초 적재(scripts/load_problems.py)는 객관식만 넣어서 수학 5,981 + 영어 5,737 = 11,718 상태였다.
  이 스크립트가 수학 단답형 3,877개를 채워 수학 9,858 + 영어 5,737 = 15,595 로 맞춘다.

규칙
  - 대상은 `수학문항_최신본/*.jsonl` 중 answer_type == 'short_answer' 인 행뿐이다.
    이미 들어가 있는 객관식 행은 payload 에 아예 담기지 않으므로 건드리지 않는다.
  - problem_code 유니크 제약 + merge-duplicates upsert 라서 몇 번을 다시 돌려도
    행이 늘거나 깨지지 않는다(멱등).
  - 0009 마이그레이션에서 새로 생긴 컬럼 중 answer_value(text) · glossary(jsonb) 를 함께 넣는다.
    원본 answer_value 는 정수라 text 컬럼에 맞춰 문자열로 변환한다.
  - 학년/학기 컬럼(grade_band·grade_min·grade_max·semester)은 여기서 넣지 않는다.
    단원(unit)에서 내려받는 값이라 backfill_grade_axis.py 가 일괄로 채운다.
  - concept_id(개념 정규화)는 다른 작업 영역이라 payload 에 포함하지 않는다(건드리지 않음).

원본 특이사항(2026-09-17 확인)
  - 단답형은 choices=[] · answer_index=null · cognitive_stage=null · glossary=null 로 일관된다.
    (인지단계는 객관식 5,981개에만 있음 → 단답형은 null 로 남는 것이 정상)
  - 단답형 난이도는 원본에 이미 있음: basic 1,052 / normal 1,262 / advanced 1,563
"""
import glob
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _bank_db import SRC, sql_or_die, upsert  # noqa: E402

BATCH = 300


def rows():
    for path in sorted(glob.glob(f"{SRC}/수학문항_최신본/*.jsonl")):
        for line in open(path):
            line = line.strip()
            if not line:
                continue
            d = json.loads(line)
            if d.get("answer_type") != "short_answer":
                continue
            av = d.get("answer_value")
            yield {
                "problem_code": d["problem_code"],
                "subject": "math",
                "unit_code": d["unit_code"],
                "question": d["question"],
                "choices": d.get("choices"),          # 단답형은 원본 그대로 [] 로 둔다
                "answer_type": "short_answer",
                "answer_index": d.get("answer_index"),
                "answer_value": None if av is None else str(av),
                "answer_text": d.get("answer_text"),
                "explanation": d.get("explanation"),
                "difficulty": d.get("difficulty"),
                "score": d.get("score"),
                "concept": d.get("concept"),
                "cognitive_stage": d.get("cognitive_stage"),
                "recommended_time_sec": d.get("recommended_time_sec"),
                "source_id": d.get("source_id"),
                "glossary": d.get("glossary"),
            }


def counts(label):
    r = sql_or_die(
        "select subject, answer_type, count(*)::int as n "
        "from problem group by 1,2 order by 1,2;"
    )
    print(f"[{label}]", {f"{x['subject']}/{x['answer_type']}": x["n"] for x in r},
          "total=", sum(x["n"] for x in r))


def main():
    counts("before")
    batch, done, errors = [], 0, 0
    for r in rows():
        batch.append(r)
        if len(batch) >= BATCH:
            err = upsert("problem", batch)
            done += len(batch)
            if err:
                errors += 1
                print(f"  [ERR @{done}] {err}", flush=True)
            elif done % 1500 == 0:
                print(f"  [{done}] ok", flush=True)
            batch = []
    if batch:
        err = upsert("problem", batch)
        done += len(batch)
        if err:
            errors += 1
            print(f"  [ERR @{done}] {err}", flush=True)
    print(f"전송 {done}건, 실패 배치 {errors}개")
    counts("after")


if __name__ == "__main__":
    main()
