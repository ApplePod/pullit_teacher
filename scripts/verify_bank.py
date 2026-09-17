"""
verify_bank.py — 문제은행 적재 결과 검증 (OPER-137 / 문제은행 1단계)

읽기 전용. 아무것도 고치지 않는다. 다음을 확인한다.
  A. 과목·정답유형·난이도·학년별 집계와 목표치(수학 9,858 + 영어 5,737 = 15,595) 일치
  B. 필수 컬럼 NULL 점검 (학년축·난이도·정답)
  C. 구조 무결성 — 객관식 보기 5개 / answer_index 1~5 / 단답형 answer_value 존재 /
     question 이 비어 있지 않은 jsonb 배열 / unit FK 고아 / problem_code 중복
  D. 무작위 20행 필드 스폿체크 (seed 고정 → 재실행해도 같은 20행)
"""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _bank_db import sql_or_die, table  # noqa: E402

TARGET = {"math": 9858, "english": 5737}


def section(title):
    print(f"\n{'=' * 72}\n{title}\n{'=' * 72}")


def main():
    ok = True

    section("A. 집계")
    rows = sql_or_die(
        "select subject::text, answer_type, count(*)::int as n "
        "from problem group by 1,2 order by 1 desc,2;"
    )
    table(rows, ["subject", "answer_type", "n"])
    per_subject = {}
    for r in rows:
        per_subject[r["subject"]] = per_subject.get(r["subject"], 0) + r["n"]
    for s, want in TARGET.items():
        got = per_subject.get(s, 0)
        mark = "OK" if got == want else "불일치"
        if got != want:
            ok = False
        print(f"  {s}: {got} / 목표 {want} → {mark}")
    total = sum(per_subject.values())
    print(f"  합계: {total} / 목표 {sum(TARGET.values())} → "
          f"{'OK' if total == sum(TARGET.values()) else '불일치'}")

    print("\n[난이도 × 과목 × 정답유형]")
    table(sql_or_die(
        "select subject::text, answer_type, coalesce(difficulty,'(null)') as difficulty, "
        "count(*)::int as n from problem group by 1,2,3 order by 1 desc,2,3;"
    ), ["subject", "answer_type", "difficulty", "n"])

    print("\n[학년·학기 축]")
    table(sql_or_die(
        "select subject::text, grade_band, grade_min, grade_max, "
        "coalesce(semester::text,'(null)') as semester, count(*)::int as n "
        "from problem group by 1,2,3,4,5 order by 1 desc,3,5;"
    ), ["subject", "grade_band", "grade_min", "grade_max", "semester", "n"])

    section("B. NULL 점검 (모두 0 이어야 정상)")
    table(sql_or_die("""
        select
          count(*) filter (where grade_band is null)::int                            as grade_band_null,
          count(*) filter (where grade_min is null or grade_max is null)::int        as grade_minmax_null,
          count(*) filter (where subject='math' and semester is null)::int           as math_semester_null,
          count(*) filter (where difficulty is null)::int                            as difficulty_null,
          count(*) filter (where difficulty not in ('basic','normal','advanced'))::int as difficulty_bad,
          count(*) filter (where score is null)::int                                 as score_null,
          count(*) filter (where recommended_time_sec is null)::int                  as rts_null,
          count(*) filter (where subject='math' and concept is null)::int            as math_concept_null
        from problem;
    """), ["grade_band_null", "grade_minmax_null", "math_semester_null", "difficulty_null",
           "difficulty_bad", "score_null", "rts_null", "math_concept_null"])
    print("\n[단원 NULL 점검]")
    table(sql_or_die("""
        select count(*)::int as units,
          count(*) filter (where grade_band is null)::int  as band_null,
          count(*) filter (where course_name is null)::int as course_null,
          count(*) filter (where exam_scope is null)::int  as scope_null
        from unit;
    """), ["units", "band_null", "course_null", "scope_null"])

    section("C. 구조 무결성 (모두 0 이어야 정상)")
    integrity = sql_or_die("""
        select
          count(*) filter (where question is null
                              or jsonb_typeof(question) <> 'array'
                              or jsonb_array_length(question) = 0)::int        as bad_question,
          count(*) filter (where answer_type='multiple_choice'
                              and (choices is null
                                or jsonb_typeof(choices) <> 'array'
                                or jsonb_array_length(choices) <> 5))::int     as mc_choices_not5,
          count(*) filter (where answer_type='multiple_choice'
                              and (answer_index is null
                                or answer_index < 1 or answer_index > 5))::int as mc_index_out_of_range,
          count(*) filter (where answer_type='multiple_choice'
                              and (answer_text is null or answer_text=''))::int as mc_answer_text_null,
          count(*) filter (where answer_type='short_answer'
                              and (answer_value is null or answer_value=''))::int as sa_answer_value_null,
          count(*) filter (where answer_type='short_answer'
                              and answer_index is not null)::int               as sa_has_index,
          count(*) filter (where explanation is null
                              or jsonb_array_length(explanation) = 0)::int     as bad_explanation,
          count(*) filter (where subject='english'
                              and (vocabulary is null or translation is null))::int as eng_missing_vocab_tr
        from problem;
    """)
    table(integrity, list(integrity[0].keys()))
    if any(v for v in integrity[0].values()):
        ok = False

    print("\n[FK · 중복]")
    extra = sql_or_die("""
        select
          (select count(*)::int from problem p
             left join unit u on u.code=p.unit_code where u.code is null) as orphan_unit_fk,
          (select count(*)::int from (
             select problem_code from problem group by 1 having count(*)>1) x) as dup_problem_code,
          (select count(*)::int from unit) as unit_rows;
    """)
    table(extra, list(extra[0].keys()))
    if extra[0]["orphan_unit_fk"] or extra[0]["dup_problem_code"]:
        ok = False

    section("D. 무작위 20행 스폿체크 (seed 고정)")
    spot = sql_or_die("""
        with s as (
          select setseed(0.42)
        ), pick as (
          select p.* from s, problem p order by md5(p.problem_code || '42') limit 20
        )
        select problem_code, subject::text as subject, answer_type,
               coalesce(difficulty,'-') as diff,
               grade_min || '~' || grade_max || ' / ' || coalesce(semester::text,'-') as grade,
               jsonb_array_length(question) as q_blocks,
               coalesce(jsonb_array_length(choices),0) as n_choices,
               coalesce(answer_index::text,'-') as idx,
               coalesce(left(answer_value,12),'-') as ans_value,
               jsonb_array_length(explanation) as expl_blocks,
               case
                 when answer_type='multiple_choice'
                      and jsonb_array_length(choices)=5
                      and answer_index between 1 and 5
                      and jsonb_array_length(question)>0 then 'PASS'
                 when answer_type='short_answer'
                      and answer_value is not null
                      and jsonb_array_length(question)>0 then 'PASS'
                 else 'FAIL' end as verdict
        from pick order by problem_code;
    """)
    table(spot, ["problem_code", "subject", "answer_type", "diff", "grade", "q_blocks",
                 "n_choices", "idx", "ans_value", "expl_blocks", "verdict"])
    if any(r["verdict"] != "PASS" for r in spot):
        ok = False

    section("결과: " + ("전부 통과" if ok else "실패 항목 있음 — 위 표 확인"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
