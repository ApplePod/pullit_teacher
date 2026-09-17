#!/usr/bin/env python3
"""
backfill_concept.py — 개념(concept) 정규화 백필 (OPER 문제은행 구조개편 2단계)

하는 일
  1) concept 테이블 채우기
     - 수학: problem 에 실제로 존재하는 (unit_code, concept 텍스트) 조합마다 1행.
             ord 는 해당 단원 안에서 "문항 수 많은 순 → 먼저 등장한 순(problem_code)".
     - 영어: 단원(unit) 자체가 유형이므로 unit.middle_name 을 개념명으로 단원당 1행.
     - 보정: 수학인데 concept 텍스트가 비어 있는 문항이 있으면
             해당 단원의 middle_name 으로 된 단원 대표 개념을 만들어 붙인다.
  2) problem.concept_id 백필 (subject 별로 join 조건이 다름)
  3) 검증 — subject 별 concept_id null 개수, 개념별 문항 수 리포트

특징
  - 몇 번을 다시 실행해도 결과가 같다(idempotent). 문항이 추가로 적재된 뒤
    (예: 수학 단답형 3,877건) 다시 돌리면 새 문항만 새로 매칭된다.
  - unit.* / problem.grade_* / semester / answer_value / glossary 는 건드리지 않는다.

사용법
  python3 scripts/backfill_concept.py            # 백필 + 검증
  python3 scripts/backfill_concept.py --dry-run  # 쓰기 없이 현재 상태만 확인
"""
import json
import os
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT, ".env.local")
PROJECT_REF = "afjdebkhukhhlpzbtxzu"


def load_env() -> dict:
    """.env.local 에서 키를 읽는다(값은 절대 출력하지 않는다)."""
    env = {}
    with open(ENV_PATH, encoding="utf-8") as fp:
        for line in fp:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


ENV = load_env()
TOKEN = ENV["SUPABASE_ACCESS_TOKEN"]


def sql(query: str):
    """Management API 로 SQL 실행 후 행 배열을 반환."""
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": query}).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    try:
        return json.loads(urllib.request.urlopen(req, timeout=300).read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()[:1500]
        raise SystemExit(f"[SQL 실패] {exc.code}\n{body}\n--- 쿼리 ---\n{query[:800]}")


# ── 1) 수학 개념: (단원, 개념 텍스트) 조합마다 1행 ────────────────────────────
#     ord = 문항 수 내림차순 → 같은 수면 먼저 등장한(problem_code 최소) 순서
SQL_MATH_CONCEPT = """
insert into concept (subject, unit_code, name, ord)
select 'math'::subject_code,
       t.unit_code,
       t.name,
       row_number() over (partition by t.unit_code order by t.cnt desc, t.first_code)::int
from (
  select p.unit_code,
         btrim(p.concept) as name,
         count(*)         as cnt,
         min(p.problem_code) as first_code
  from problem p
  where p.subject = 'math'
    and p.concept is not null
    and btrim(p.concept) <> ''
  group by p.unit_code, btrim(p.concept)
) t
on conflict (unit_code, name) do update set ord = excluded.ord;
"""

# ── 1-보정) 개념 텍스트가 비어 있는 수학 문항용 단원 대표 개념 ─────────────────
SQL_MATH_FALLBACK_CONCEPT = """
insert into concept (subject, unit_code, name, ord)
select 'math'::subject_code, u.code, u.middle_name, 999
from unit u
where u.subject = 'math'
  and u.middle_name is not null
  and exists (
    select 1 from problem p
    where p.subject = 'math' and p.unit_code = u.code
      and btrim(coalesce(p.concept, '')) = ''
  )
on conflict (unit_code, name) do nothing;
"""

# ── 1-영어) 단원(유형) 당 개념 1행 ────────────────────────────────────────────
SQL_ENGLISH_CONCEPT = """
insert into concept (subject, unit_code, name, ord)
select 'english'::subject_code, u.code, u.middle_name, 1
from unit u
where u.subject = 'english' and u.middle_name is not null
on conflict (unit_code, name) do update set ord = excluded.ord;
"""

# ── 2) problem.concept_id 백필 ───────────────────────────────────────────────
SQL_LINK_MATH = """
update problem p
set concept_id = c.id
from concept c
where p.subject = 'math'
  and c.subject = 'math'
  and c.unit_code = p.unit_code
  and c.name = btrim(p.concept)
  and p.concept_id is distinct from c.id;
"""

SQL_LINK_MATH_FALLBACK = """
update problem p
set concept_id = c.id
from concept c
join unit u on u.code = c.unit_code
where p.subject = 'math'
  and btrim(coalesce(p.concept, '')) = ''
  and c.unit_code = p.unit_code
  and c.name = u.middle_name
  and p.concept_id is distinct from c.id;
"""

SQL_LINK_ENGLISH = """
update problem p
set concept_id = c.id
from concept c
where p.subject = 'english'
  and c.subject = 'english'
  and c.unit_code = p.unit_code
  and p.concept_id is distinct from c.id;
"""

# ── 3) 검증 쿼리 ─────────────────────────────────────────────────────────────
SQL_NULLS = """
select subject,
       count(*)                                  as total,
       count(*) filter (where concept_id is null) as null_concept_id
from problem group by subject order by subject;
"""

SQL_CONCEPT_COUNT = """
select c.subject, count(*) as concepts
from concept c group by c.subject order by c.subject;
"""

SQL_PER_UNIT = """
select u.subject, u.code as unit_code, u.middle_name,
       count(distinct c.id) as concepts,
       count(p.id)          as problems
from unit u
left join concept c on c.unit_code = u.code
left join problem p on p.concept_id = c.id
group by u.subject, u.code, u.middle_name, u.ord
order by u.subject desc, u.ord;
"""

SQL_PER_CONCEPT = """
select u.subject, c.unit_code, u.middle_name, c.name, c.ord, count(p.id) as problems
from concept c
join unit u on u.code = c.unit_code
left join problem p on p.concept_id = c.id
group by u.subject, c.unit_code, u.middle_name, c.name, c.ord, u.ord
order by u.subject desc, u.ord, c.ord;
"""

SQL_THIN = """
select u.subject, c.unit_code, c.name, count(p.id) as problems
from concept c
join unit u on u.code = c.unit_code
left join problem p on p.concept_id = c.id
group by u.subject, c.unit_code, c.name
having count(p.id) < 3
order by count(p.id), c.unit_code;
"""


def report(dry_run: bool) -> None:
    nulls = sql(SQL_NULLS)
    print("\n[subject 별 concept_id null]")
    for r in nulls:
        print(f"  {r['subject']:8s} total={r['total']:6d}  null={r['null_concept_id']:6d}")

    print("\n[subject 별 concept 행 수]")
    for r in sql(SQL_CONCEPT_COUNT):
        print(f"  {r['subject']:8s} {r['concepts']}")

    print("\n[단원별 개념 수 / 문항 수]")
    for r in sql(SQL_PER_UNIT):
        print(f"  {r['subject']:8s} {r['unit_code']:20s} {str(r['middle_name']):16s} "
              f"개념={r['concepts']:3d} 문항={r['problems']:5d}")

    thin = sql(SQL_THIN)
    print(f"\n[문항 3개 미만 개념: {len(thin)}건]")
    for r in thin:
        print(f"  {r['subject']:8s} {r['unit_code']:20s} {r['name']} → {r['problems']}")

    if not dry_run:
        out = os.path.join(ROOT, "scripts", "concept_backfill_report.json")
        with open(out, "w", encoding="utf-8") as fp:
            json.dump({"nulls": nulls, "per_concept": sql(SQL_PER_CONCEPT), "thin": thin},
                      fp, ensure_ascii=False, indent=1)
        print(f"\n개념별 상세 리포트 → {out}")

    bad = [r for r in nulls if r["null_concept_id"] > 0]
    if bad and not dry_run:
        print("\n[경고] concept_id 가 비어 있는 문항이 남아 있습니다:", bad)
        sys.exit(1)


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("== dry-run: 쓰기 없이 현재 상태만 확인 ==")
        report(True)
        return

    print("1) 수학 개념 생성/갱신 …")
    sql(SQL_MATH_CONCEPT)
    print("1-b) 개념 텍스트가 빈 수학 문항용 단원 대표 개념 …")
    sql(SQL_MATH_FALLBACK_CONCEPT)
    print("1-c) 영어 단원(유형) 개념 생성/갱신 …")
    sql(SQL_ENGLISH_CONCEPT)

    print("2) problem.concept_id 백필 …")
    sql(SQL_LINK_MATH)
    sql(SQL_LINK_MATH_FALLBACK)
    sql(SQL_LINK_ENGLISH)

    print("3) 검증 …")
    report(False)
    print("\n완료.")


if __name__ == "__main__":
    main()
