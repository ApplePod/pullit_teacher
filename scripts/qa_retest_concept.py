#!/usr/bin/env python3
"""
qa_retest_concept.py — 오답출제(재시험지) 실동작 라운드트립 QA

시나리오
  1) 로그인 → 학생별 채점에서 미채점 문제지 1건을 "전부 오답"으로 채점
  2) 그 행을 선택하고 [오답출제] 클릭
  3) DB 에서 새로 생긴 "… 오답 재출제" 문제지를 열어
     - 문항 수가 틀린 문항 수와 같은지
     - 틀린 문항과 겹치지 않는 "다른" 문항인지
     - 개념(concept_id)이 같은지 / 난이도가 유지되는지
     - 그 학생이 이미 배정받았던 문항이 섞여 있지 않은지
     를 검증한다.

주의
  - 서버는 이미 3777 에서 떠 있어야 한다(직접 띄우지 않는다).
  - 3777 이 `next start`(프로덕션 빌드)라면 .next 가 소스보다 오래된 경우 **옛 코드**가 돈다.
    아래에서 빌드 시각을 비교해 경고하며, 그런 경우 로직 검증은 scripts/verify_retest_pick.py 로 한다.
사용법: python3 scripts/qa_retest_concept.py
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("BASE", f"http://localhost:{os.environ.get('OURS_PORT', '3777')}")
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
        return json.loads(urllib.request.urlopen(req, timeout=180).read().decode())
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"[SQL 실패] {exc.code} {exc.read().decode()[:800]}")


fails = []


def chk(name, cond, detail=""):
    print(("  OK  " if cond else "  FAIL") + f" {name}" + (f" — {detail}" if detail else ""))
    if not cond:
        fails.append(name)


n = lambda t: " ".join((t or "").split())

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--window-size=1500,1100")
d = webdriver.Chrome(options=opts)
d.set_page_load_timeout(150)


def click(text, css="button", exact=False):
    for b in d.find_elements(By.CSS_SELECTOR, css):
        t = n(b.text)
        if (t == text) if exact else (text in t):
            d.execute_script("arguments[0].scrollIntoView({block:'center'});arguments[0].click()", b)
            return True
    return False


def alert_text():
    e = d.find_elements(By.CSS_SELECTOR, ".modal.show.max-400 .modal-body, .modal.modal--xsmall.show .modal-body")
    return n(e[0].text)[:90] if e else ""


def alert_ok():
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-footer button"):
        if n(x.text) in ("확인", "저장", "적용"):
            d.execute_script("arguments[0].click()", x)
            return True
    return False


BUILD_ID = os.path.join(ROOT, ".next", "BUILD_ID")
SRC = os.path.join(ROOT, "src", "app", "(portal)", "clinic", "clinicActions.ts")
if os.path.exists(BUILD_ID) and os.path.getmtime(BUILD_ID) < os.path.getmtime(SRC):
    print("[경고] .next 빌드가 clinicActions.ts 보다 오래됐습니다. "
          "3777 이 next start 라면 옛 코드가 돌아 재출제 검증이 실패할 수 있습니다.")

try:
    print("[0] 실행 전 재출제 문제지 수")
    before = sql("select count(*) c from paper where name like '%오답 재출제'")[0]["c"]
    print(f"  before = {before}")

    print("\n[1] 로그인")
    d.get(BASE + "/login")
    time.sleep(2.5)
    d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
    d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
    d.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    time.sleep(4)
    chk("로그인", "/login" not in d.current_url, d.current_url)

    def open_list(path):
        """목록이 실제로 그려질 때까지 기다린다(첫 진입 시 컴파일이 오래 걸릴 수 있음)."""
        d.get(BASE + path)
        for _ in range(40):
            if d.find_elements(By.CSS_SELECTOR, "ul.table-body"):
                time.sleep(1.2)
                return d.find_elements(By.CSS_SELECTOR, "ul.table-body")
            time.sleep(1.5)
        return []

    # 학생별/반별 중 실제 데이터가 있는 화면을 쓴다 (현재 시드 데이터는 반 배정이라 반별 채점에 뜬다)
    page = "/clinic/studentmark"
    body = open_list(page)
    if not body:
        page = "/clinic/class"
        body = open_list(page)
    chk("채점 목록 로드", len(body) > 0, f"{page} {len(body)}행")
    if not body:
        raise SystemExit("채점 목록이 비어 QA 중단")

    print("\n[2] 미채점이 있으면 전부 오답 처리")
    unmarked = [b for b in d.find_elements(By.CSS_SELECTOR, "button") if n(b.text) == "미채점"]
    print(f"   미채점 {len(unmarked)}건")
    if unmarked:
        d.execute_script("arguments[0].click()", unmarked[0])
        time.sleep(4)
        xs = [b for b in d.find_elements(By.CSS_SELECTOR, ".modal.show button") if n(b.text) in ("X", "오답")]
        print(f"   오답 버튼 {len(xs)}개")
        for x in xs:
            d.execute_script("arguments[0].click()", x)
        time.sleep(0.6)
        click("채점 저장") or click("저장", ".modal.show button")
        time.sleep(5)
        print("   채점 저장 알림:", alert_text())
        alert_ok()
        time.sleep(3)

    print("\n[3] 오답이 있는 행을 선택하고 [오답출제]")
    body = open_list(page)
    target = None
    for ul in body:
        if "오답출제" in n(ul.text):                      # 오답출제 가능 = 채점완료 + 오답 존재
            target = ul
            break
    chk("오답출제 가능 행", target is not None)
    if target is None:
        raise SystemExit("오답출제 가능한 행이 없어 QA 중단")
    sel = target.find_elements(By.CSS_SELECTOR, "input[type=checkbox], input[type=radio]")
    if sel:
        d.execute_script("arguments[0].click()", sel[0])
    time.sleep(0.8)
    chk("오답출제 버튼 클릭", click("오답출제", ".category-btns-item", exact=True))
    time.sleep(8)
    msg = alert_text()
    chk("배정 완료 알림", "배정" in msg or "오답" in msg, msg)
    alert_ok()
    time.sleep(2)

    print("\n[4] DB 검증 — 새로 만든 재출제 문제지")
    after = sql("select count(*) c from paper where name like '%오답 재출제'")[0]["c"]
    chk("재출제 문제지 생성됨", after > before, f"{before} → {after}")

    detail = sql("""
      with newest as (
        select p.id, p.name, w.id as set_id, w.student_id
        from paper p join wrong_answer_set w on w.paper_id = p.id
        where p.name like '%오답 재출제' order by p.created_at desc limit 5
      )
      select nw.name, nw.student_id::text,
        (select count(*) from wrong_answer_item i where i.set_id = nw.set_id)                as wrong_n,
        (select count(*) from paper_problem pp where pp.paper_id = nw.id)                    as new_n,
        (select count(*) from paper_problem pp join wrong_answer_item i
            on i.problem_code = pp.problem_code and i.set_id = nw.set_id
          where pp.paper_id = nw.id)                                                         as overlap,
        (select count(*) from paper_problem pp join problem pn on pn.problem_code = pp.problem_code
          where pp.paper_id = nw.id and pn.concept_id in
            (select p2.concept_id from wrong_answer_item i2 join problem p2 on p2.problem_code = i2.problem_code
              where i2.set_id = nw.set_id))                                                  as concept_match,
        (select count(*) from paper_problem pp join problem pn on pn.problem_code = pp.problem_code
          where pp.paper_id = nw.id and pn.difficulty in
            (select p2.difficulty from wrong_answer_item i2 join problem p2 on p2.problem_code = i2.problem_code
              where i2.set_id = nw.set_id))                                                  as diff_match,
        (select count(*) from paper_problem pp where pp.paper_id = nw.id and pp.problem_code in (
            select pp2.problem_code from paper_problem pp2
            join assignment a on a.paper_id = pp2.paper_id
            join assignment_student ast on ast.assignment_id = a.id
            where ast.student_id = nw.student_id and pp2.paper_id <> nw.id))                 as already_assigned
      from newest nw
    """)
    for row in detail:
        print("  " + json.dumps(row, ensure_ascii=False))
    chk("재출제 문제지 존재", len(detail) > 0)
    for row in detail:
        tag = row["name"][:24]
        chk(f"문항 수 유지 ({tag})", row["new_n"] == row["wrong_n"], f"오답 {row['wrong_n']} / 재출제 {row['new_n']}")
        chk(f"틀린 문항과 안 겹침 ({tag})", row["overlap"] == 0, f"겹침 {row['overlap']}")
        chk(f"전부 같은 개념 ({tag})", row["concept_match"] == row["new_n"], f"{row['concept_match']}/{row['new_n']}")
        chk(f"난이도 유지 ({tag})", row["diff_match"] == row["new_n"], f"{row['diff_match']}/{row['new_n']}")
        chk(f"기배정 문항 없음 ({tag})", row["already_assigned"] == 0, f"{row['already_assigned']}건")

    print("\n[5] 오답모음생성은 그대로 (실제 틀린 문항)")
    body = open_list(page)
    if body:
        sel = body[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox], input[type=radio]")
        if sel:
            d.execute_script("arguments[0].click()", sel[0])
        time.sleep(0.8)
        chk("오답모음생성 클릭", click("오답모음생성", ".category-btns-item", exact=True))
        time.sleep(8)
        print("   알림:", alert_text())
        alert_ok()
        time.sleep(2)
        coll = sql("""
          with newest as (
            select p.id, w.id as set_id from paper p join wrong_answer_set w on w.paper_id = p.id
            where p.name like '%오답모음' order by p.created_at desc limit 1
          )
          select (select count(*) from paper_problem pp where pp.paper_id = (select id from newest)) as new_n,
                 (select count(*) from paper_problem pp join wrong_answer_item i
                    on i.problem_code = pp.problem_code and i.set_id = (select set_id from newest)
                   where pp.paper_id = (select id from newest)) as same_as_wrong
        """)[0]
        print("  " + json.dumps(coll, ensure_ascii=False))
        chk("오답모음 = 실제 틀린 문항 그대로", coll["new_n"] > 0 and coll["new_n"] == coll["same_as_wrong"], json.dumps(coll))
finally:
    d.quit()

print("\n실패:", fails if fails else "없음")
sys.exit(1 if fails else 0)
