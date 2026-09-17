"""
backfill_grade_axis.py — 학년·학기 축 백필 (OPER-137 / 문제은행 1단계, 마이그레이션 0009)

하는 일
  1) unit 36개에 grade_band · grade_min · grade_max · semester · course_name · exam_scope 를 채운다.
  2) problem 전 행(15,595)에 같은 값을 unit 에서 비정규화 복사한다(검색 필터 속도용).

학년·학기 매핑 근거 — 학원의 통상 진도 순서
  고등 수학은 학교마다 편차가 있지만 학원 현장에서는 대체로 아래 순서로 나간다.
    · 수학Ⅰ        : 고2 1학기에 처음 나가고, 고3 수능 대비까지 반복 → grade 2~3, semester 1
    · 수학Ⅱ        : 수학Ⅰ 다음인 고2 2학기 진도, 역시 고3까지 → grade 2~3, semester 2
    · 확률과 통계   : 선택과목이라 고3에 들어가서 정리 → grade 3~3, semester 1
    · 영어(유형 전체): 특정 학년 과정이 아니라 고1~고3 전 학년이 유형별로 도는 수능 대비용
                     → grade 1~3, semester 는 학기 개념이 없으므로 null
  exam_scope 는 원본 문항이 모두 수능형이라 전부 '수능'.
  영어 course_name 은 별도 과목명이 없으므로 단원의 large_name(대의 파악 / 주장과 글의 흐름 /
  추론 / 세부 정보 파악)을 그대로 쓴다.

멱등성
  전부 고정값 UPDATE 라서 몇 번을 다시 돌려도 결과가 같다.
  problem 쪽은 unit 을 조인해 덮어쓰므로 unit 매핑만 바꿔서 다시 돌리면 문항까지 같이 갱신된다.
  문항의 다른 컬럼(문제 본문·정답·난이도·concept_id 등)은 건드리지 않는다.
"""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _bank_db import sql_or_die, table  # noqa: E402

# (unit code prefix, grade_band, grade_min, grade_max, semester, course_name, exam_scope)
MATH_MAP = [
    ("math_2022_1_", "high", 2, 3, 1, "수학Ⅰ", "수능"),
    ("math_2022_2_", "high", 2, 3, 2, "수학Ⅱ", "수능"),
    ("math_2022_3_", "high", 3, 3, 1, "확률과 통계", "수능"),
]


def backfill_unit():
    stmts = []
    for prefix, band, gmin, gmax, sem, course, scope in MATH_MAP:
        stmts.append(
            f"update unit set grade_band='{band}', grade_min={gmin}, grade_max={gmax}, "
            f"semester={sem}, course_name='{course}', exam_scope='{scope}' "
            f"where subject='math' and code like '{prefix}%';"
        )
    # 영어: 고1~고3 공통, 학기 개념 없음(null), 과목명은 단원의 대분류명
    stmts.append(
        "update unit set grade_band='high', grade_min=1, grade_max=3, "
        "semester=null, course_name=large_name, exam_scope='수능' "
        "where subject='english';"
    )
    sql_or_die("\n".join(stmts))


def backfill_problem():
    # unit → problem 비정규화. 값이 이미 같으면 쓰지 않도록 is distinct from 으로 건너뛴다.
    sql_or_die(
        """
        update problem p
           set grade_band = u.grade_band,
               grade_min  = u.grade_min,
               grade_max  = u.grade_max,
               semester   = u.semester
          from unit u
         where u.code = p.unit_code
           and (p.grade_band is distinct from u.grade_band
             or p.grade_min  is distinct from u.grade_min
             or p.grade_max  is distinct from u.grade_max
             or p.semester   is distinct from u.semester);
        """
    )


def report():
    print("\n[unit 백필 결과]")
    table(
        sql_or_die(
            "select subject, course_name, grade_band, grade_min, grade_max, "
            "coalesce(semester::text,'(null)') as semester, exam_scope, count(*)::int as units "
            "from unit group by 1,2,3,4,5,6,7 order by subject desc, course_name;"
        ),
        ["subject", "course_name", "grade_band", "grade_min", "grade_max",
         "semester", "exam_scope", "units"],
    )

    print("\n[unit 미채움(NULL) 점검]")
    table(
        sql_or_die(
            "select count(*)::int as null_band, "
            "count(*) filter (where grade_min is null)::int as null_min, "
            "count(*) filter (where course_name is null)::int as null_course, "
            "count(*) filter (where exam_scope is null)::int as null_scope "
            "from unit where grade_band is null or grade_min is null "
            "or grade_max is null or course_name is null or exam_scope is null;"
        ),
        ["null_band", "null_min", "null_course", "null_scope"],
    )

    print("\n[problem 비정규화 결과]")
    table(
        sql_or_die(
            "select subject, grade_band, grade_min, grade_max, "
            "coalesce(semester::text,'(null)') as semester, count(*)::int as problems "
            "from problem group by 1,2,3,4,5 order by subject desc, grade_min, semester;"
        ),
        ["subject", "grade_band", "grade_min", "grade_max", "semester", "problems"],
    )

    print("\n[problem 미채움(NULL) 점검 — semester 는 영어에서 의도적 null]")
    table(
        sql_or_die(
            "select count(*) filter (where grade_band is null)::int as null_band, "
            "count(*) filter (where grade_min is null)::int as null_min, "
            "count(*) filter (where grade_max is null)::int as null_max, "
            "count(*) filter (where subject='math' and semester is null)::int as math_null_sem, "
            "count(*) filter (where subject='english' and semester is not null)::int as eng_bad_sem "
            "from problem;"
        ),
        ["null_band", "null_min", "null_max", "math_null_sem", "eng_bad_sem"],
    )


if __name__ == "__main__":
    backfill_unit()
    backfill_problem()
    report()
