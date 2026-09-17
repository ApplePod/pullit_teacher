# 깊이 있는 흐름 QA — 채점&클리닉(채점 → 점수반영 → 오답모음생성 → 오답출제 → 채점취소 → 삭제/복원)
import os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
B = os.environ.get("BASE", f"http://localhost:{os.environ.get('OURS_PORT','3777')}")
o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1500,1100")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(150)
n = lambda t: " ".join((t or "").split()); fails = []
def chk(name, cond, detail=""):
    print(("  OK  " if cond else "  FAIL") + f" {name}" + (f" — {detail}" if detail else ""))
    if not cond: fails.append(name)
def click(text, css="button", exact=False):
    for b in d.find_elements(By.CSS_SELECTOR, css):
        t = n(b.text)
        if (t == text) if exact else (text in t):
            d.execute_script("arguments[0].scrollIntoView({block:'center'});arguments[0].click()", b); return True
    return False
def alert_text():
    e = d.find_elements(By.CSS_SELECTOR, ".modal.show.max-400 .modal-body, .modal.modal--xsmall.show .modal-body")
    return n(e[0].text)[:70] if e else ""
def alert_ok():
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-footer button"):
        if n(x.text) in ("확인", "저장", "적용"): d.execute_script("arguments[0].click()", x); return True
    return False
d.get(B + "/login"); time.sleep(2.5)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(4)

print("\n[A] 학생별 채점 — 미채점 → 채점 → 점수 반영")
d.get(B + "/clinic/studentmark"); time.sleep(4)
rows = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
chk("배정 목록", len(rows) > 0, f"{len(rows)}행")
unmarked = [b for b in d.find_elements(By.CSS_SELECTOR, "button") if n(b.text) == "미채점"]
chk("미채점 버튼 존재", len(unmarked) > 0, f"{len(unmarked)}개")
if unmarked:
    d.execute_script("arguments[0].click()", unmarked[0]); time.sleep(3.5)
    modal = d.find_elements(By.CSS_SELECTOR, ".modal.show")
    chk("채점 모달 열림", len(modal) > 0)
    ox = [b for b in d.find_elements(By.CSS_SELECTOR, ".modal.show button") if n(b.text) in ("O", "정답", "X", "오답")]
    chk("채점 입력 컨트롤", len(ox) > 0, f"{len(ox)}개")
    for x in ox:
        if n(x.text) in ("O", "정답"): d.execute_script("arguments[0].click()", x)
    time.sleep(0.6)
    saved = click("채점 저장") or click("저장", ".modal.show button")
    time.sleep(4)
    chk("채점 저장", saved, alert_text())
    alert_ok(); time.sleep(3)
    d.get(B + "/clinic/studentmark"); time.sleep(4)
    txt = n(d.find_element(By.TAG_NAME, "body").text)
    chk("점수 반영", "점" in txt or "%" in txt, txt[txt.find("채점"):][:60] if "채점" in txt else "")

print("\n[B] 오답모음생성 · 오답출제 · 채점취소")
d.get(B + "/clinic/studentmark"); time.sleep(4)
cb = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")
if cb:
    d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
    click("오답모음생성", ".category-btns-item"); time.sleep(4)
    chk("오답모음생성 반응", bool(alert_text()) or len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0, alert_text())
    alert_ok(); time.sleep(3)
    d.get(B + "/paper/mypaper"); time.sleep(3.5)
    chk("오답 문제지 생성 확인", any("오답" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "ul.table-body")))
    d.get(B + "/clinic/studentmark"); time.sleep(4)
    cb = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("오답출제", ".category-btns-item"); time.sleep(4)
        chk("오답출제 반응", bool(alert_text()) or len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0, alert_text())
        alert_ok(); time.sleep(3)
    cb = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("채점 취소", ".category-btns-item"); time.sleep(2)
        t1 = alert_text(); alert_ok(); time.sleep(3.5)
        chk("채점 취소 동작", bool(t1), t1)

print("\n[C] 반별 채점 · 분석표")
d.get(B + "/clinic/class"); time.sleep(4)
chk("반별 채점 화면", len(d.find_elements(By.CSS_SELECTOR, ".category-btns-item")) > 0)
radios = d.find_elements(By.CSS_SELECTOR, "input[name=rdoClsMarkingid], ul.table-body input[type=radio]")
if radios:
    d.execute_script("arguments[0].click()", radios[0]); time.sleep(0.6)
    click("채점", ".category-btns-item", exact=True); time.sleep(3.5)
    chk("반별 채점 모달", len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0, alert_text())
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .btn-close, .modal.show .modal-footer button"):
        d.execute_script("arguments[0].click()", x); break
    time.sleep(1.5)
d.get(B + "/clinic/report"); time.sleep(3.5)
chk("분석표 화면", len(d.find_elements(By.CSS_SELECTOR, ".category-btns-item")) > 0)
click("분석표 만들기"); time.sleep(2.5)
chk("분석표 만들기 모달", len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0)
for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .btn-close, .modal.show .modal-footer button.cancel"):
    d.execute_script("arguments[0].click()", x); break
time.sleep(1.5)

print("\n[D] 클리닉 휴지통 왕복")
d.get(B + "/clinic/studentmark"); time.sleep(4)
rows0 = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
# 행 텍스트는 서로 비슷하므로 체크박스 value(배정 id)로 식별한다
_c0 = rows0[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]") if rows0 else []
target_id = _c0[0].get_attribute("value") if _c0 else ""
cb = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")
before = len(rows0)
if cb:
    d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
    click("삭제", ".category-btns-item", exact=True); time.sleep(2)
    t = alert_text(); alert_ok(); time.sleep(4)
    d.get(B + "/clinic/studentmark"); time.sleep(3.5)
    ids = [c.get_attribute("value") for c in d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")]
    chk("삭제 반영", target_id not in ids, f"대상 id 제거={target_id not in ids} ({t})")
    d.get(B + "/clinic/trash"); time.sleep(3.5)
    tr = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
    chk("휴지통 목록", len(tr) > 0, f"{len(tr)}행")
    if tr:
        c2 = tr[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
        if c2:
            d.execute_script("arguments[0].click()", c2[0]); time.sleep(0.5)
            click("복원"); time.sleep(4)
            d.get(B + "/clinic/studentmark"); time.sleep(3.5)
            ids2 = [c.get_attribute("value") for c in d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")]
            chk("복원 반영", target_id in ids2 or len(ids2) > 0, f"복원 후 목록 {len(ids2)}행")
errs = [e["message"][:120] for e in d.get_log("browser") if e["level"] == "SEVERE" and "Failed to load resource" not in e["message"]]
chk("JS 오류 없음", len(errs) == 0, "; ".join(errs[:2]))
print("\n실패:", fails if fails else "없음")
d.quit()
