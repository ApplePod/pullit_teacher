#!/usr/bin/env python3
"""
verify_retest_pick.py — 오답 재출제 대체문항 선택 로직을 DB 데이터로 직접 검증

clinicActions.ts 의 pickAlternative() 와 같은 폴백 체인을 파이썬으로 그대로 재현해
실제 문제은행 데이터에서 어떤 단계까지 내려가는지, 빈 문제지가 생길 여지가 있는지 확인한다.

  1) 커버리지 — 문제은행 전체를 대상으로 "이 문항이 오답이면 몇 단계에서 대체문항이 나오는가"
     1단계 같은 개념+난이도+문항유형 / 2단계 같은 개념+난이도 / 3단계 같은 개념 /
     4단계 같은 단원+난이도 / 5단계 같은 단원 / 6단계(원본 그대로) 로 분류
  2) 실제 채점 데이터 시뮬레이션 — 현재 DB 의 오답(marking.is_correct=false)을 그대로 넣어
     재출제 문항을 뽑아보고 "원본과 다른가 / 개념이 같은가 / 중복이 없는가"를 검증

사용법: python3 scripts/verify_retest_pick.py
"""
import json
import os
import urllib.error
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_REF = "afjdebkhukhhlpzbtxzu"

ENV = {}
with open(os.path.join(ROOT, ".env.local"), encoding="utf-8") as fp:
    for line in fp:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            ENV[k.strip()] = v.strip()


def sql(query: str):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": query}).encode(), method="POST",
        headers={"Authorization": f"Bearer {ENV['SUPABASE_ACCESS_TOKEN']}", "Content-Type": "application/json"})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=300).read().decode())
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"[SQL 실패] {exc.code} {exc.read().decode()[:800]}")


# ── clinicActions.ts 와 동일한 시드/선택 로직 ────────────────────────────────
def seed_of(code: str) -> int:
    h = 0
    for ch in code:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h


def pick_from(cands, used, exclude, seed):
    ok = sorted([b for b in cands if b["problem_code"] not in used and b["problem_code"] not in exclude],
                key=lambda b: b["problem_code"])
    return ok[seed % len(ok)]["problem_code"] if ok else None


def pick_alternative(src, by_concept, by_unit, used, exclude):
    """폴백 체인: 개념+난이도+유형 → 개념+난이도 → 개념 → 단원+난이도 → 단원 → 원본."""
    seed = seed_of(src["problem_code"])
    same_concept = by_concept.get(src["concept_id"], []) if src["concept_id"] else []
    same_unit = by_unit.get(src["unit_code"], [])
    dif = lambda l: [b for b in l if b["difficulty"] == src["difficulty"]]
    typ = lambda l: [b for b in l if b["answer_type"] == src["answer_type"]]
    chain = ((1, typ(dif(same_concept))), (2, dif(same_concept)), (3, same_concept),
             (4, dif(same_unit)), (5, same_unit))
    for step, cands in chain:
        got = pick_from(cands, used, exclude, seed)
        if got:
            return got, step
    return src["problem_code"], 6


print("문제은행 로딩 …")
bank = []
PAGE = 5000
for off in range(0, 200000, PAGE):
    rows = sql(f"select problem_code, unit_code, concept_id::text as concept_id, difficulty, answer_type, subject "
               f"from problem order by problem_code offset {off} limit {PAGE}")
    bank.extend(rows)
    if len(rows) < PAGE:
        break
print(f"  {len(bank)}문항")

by_code = {b["problem_code"]: b for b in bank}
by_concept, by_unit = defaultdict(list), defaultdict(list)
for b in bank:
    if b["concept_id"]:
        by_concept[b["concept_id"]].append(b)
    by_unit[b["unit_code"]].append(b)

print("\n[1] 커버리지 — 오답 1건당 몇 단계에서 대체문항이 나오나 (전체 문항 시뮬레이션)")
steps = defaultdict(int)
steps_by_subject = defaultdict(lambda: defaultdict(int))
for b in bank:
    _, step = pick_alternative(b, by_concept, by_unit, set(), {b["problem_code"]})
    steps[step] += 1
    steps_by_subject[b["subject"]][step] += 1
label = {1: "1 개념+난이도+유형", 2: "2 개념+난이도", 3: "3 개념", 4: "4 단원+난이도", 5: "5 단원", 6: "6 원본그대로(대체불가)"}
for s in sorted(steps):
    print(f"  {label[s]:26s} {steps[s]:6d}  ({steps[s] / len(bank) * 100:.2f}%)")
for subj in steps_by_subject:
    detail = ", ".join(f"{label[s]}={steps_by_subject[subj][s]}" for s in sorted(steps_by_subject[subj]))
    print(f"  · {subj}: {detail}")

print("\n[2] 실제 채점 데이터 시뮬레이션 (marking.is_correct = false)")
wrongs = sql("""
  select ast.id as as_id, ast.student_id::text as student_id, s.name as student, m.problem_code
  from marking m
  join assignment_student ast on ast.id = m.assignment_student_id
  join student s on s.id = ast.student_id
  where m.is_correct = false and ast.status = 'marked'
  order by ast.id, m.problem_code
""")
assigned = sql("""
  select ast.student_id::text as student_id, pp.problem_code
  from assignment_student ast
  join assignment a on a.id = ast.assignment_id
  join paper_problem pp on pp.paper_id = a.paper_id
""")
assigned_by = defaultdict(set)
for r in assigned:
    assigned_by[r["student_id"]].add(r["problem_code"])

groups = defaultdict(list)
meta = {}
for r in wrongs:
    groups[r["as_id"]].append(r["problem_code"])
    meta[r["as_id"]] = (r["student_id"], r["student"])

problems = 0
for as_id, codes in groups.items():
    student_id, student = meta[as_id]
    exclude = set(codes) | assigned_by[student_id]
    used, out = set(), []
    for code in codes:
        src = by_code.get(code)
        got, step = (pick_alternative(src, by_concept, by_unit, used, exclude) if src else (code, 6))
        used.add(got)
        out.append((code, got, step))
    same_cnt = len(out) == len(codes)
    no_dup = len(set(g for _, g, _ in out)) == len(out)
    no_overlap = all(g not in set(codes) for _, g, _ in out)
    same_concept = all(by_code[g]["concept_id"] == by_code[c]["concept_id"] for c, g, _ in out if g in by_code and c in by_code)
    not_assigned = all(g not in assigned_by[student_id] for _, g, _ in out)
    ok = same_cnt and no_dup and no_overlap and not_assigned
    print(f"  {student}({as_id[:8]}) 오답 {len(codes)}건 → 재출제 {len(out)}건 "
          f"| 개수유지={same_cnt} 중복없음={no_dup} 원본제외={no_overlap} 개념일치={same_concept} 기배정제외={not_assigned}")
    for c, g, s in out:
        print(f"      {c} → {g}  (단계 {s}, 개념 {'같음' if by_code.get(g, {}).get('concept_id') == by_code.get(c, {}).get('concept_id') else '다름'}, "
              f"난이도 {by_code.get(c, {}).get('difficulty')}→{by_code.get(g, {}).get('difficulty')})")
    if not ok:
        problems += 1

print(f"\n검증 실패 배정: {problems}건")
