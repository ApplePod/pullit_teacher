# 깊이 있는 흐름 QA — 학원관리(학생·교사·반·출결·교재·개별교재·통계·교실설정·프로필)
import os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
B = os.environ.get("BASE", f"http://localhost:{os.environ.get('OURS_PORT','3777')}")
o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1500,1100")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(150)
n = lambda t: " ".join((t or "").split()); fails = []
QA_TAG = time.strftime("%H%M%S")   # 매 실행마다 고유 이름(중복 데이터로 인한 오탐 방지)
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
    e = d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-body")
    return n(e[-1].text)[:70] if e else ""
def alert_ok():
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-footer button"):
        if n(x.text) in ("확인", "저장", "적용"): d.execute_script("arguments[0].click()", x); return True
    return False
def fill(sel, val):
    e = d.find_elements(By.CSS_SELECTOR, sel)
    if e: d.execute_script("arguments[0].scrollIntoView({block:'center'})", e[0]); e[0].clear(); e[0].send_keys(val); return True
    return False
d.get(B + "/login"); time.sleep(2.5)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(4)

print("\n[A] 학생 등록 → 목록 → 수정 → 삭제")
d.get(B + "/management/student"); time.sleep(3.5)
before = len(d.find_elements(By.CSS_SELECTOR, "table tbody tr"))
click("학생 등록"); time.sleep(3.5)
chk("학생 등록 폼 진입", "/studentform" in d.current_url, d.current_url)
click("저장하기"); time.sleep(1.5)
chk("빈 저장 검증", "학생명" in alert_text(), alert_text()); alert_ok(); time.sleep(0.8)
fill("#stdName", f"QA학생{QA_TAG}"); fill("#stdHp", "010-1111-2222")
st = d.find_elements(By.CSS_SELECTOR, "label[for=userStatus_MS10]")
if st: d.execute_script("arguments[0].click()", st[0])
time.sleep(0.5)
click("저장하기"); time.sleep(4)
chk("학생 저장 완료", "저장" in alert_text() or "완료" in alert_text(), alert_text()); alert_ok(); time.sleep(3)
d.get(B + "/management/student"); time.sleep(3.5)
rows = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
chk("목록 반영", len(rows) == before + 1 or any(f"QA학생{QA_TAG}" in n(r.text) for r in rows), f"{before} → {len(rows)}")
target = [r for r in rows if f"QA학생{QA_TAG}" in n(r.text)]
if target:
    for b in target[0].find_elements(By.CSS_SELECTOR, "button"):
        if n(b.text) == "보기": d.execute_script("arguments[0].click()", b); break
    time.sleep(3.5)
    chk("학생 수정 화면", "id=" in d.current_url, d.current_url[-40:])
    val = d.execute_script("const e=document.querySelector('#stdName'); return e?e.value:null")
    chk("수정 화면 값 로드", val == f"QA학생{QA_TAG}", str(val))
    fill("#stdName", f"QA학생{QA_TAG}수정"); click("저장하기"); time.sleep(4); alert_ok(); time.sleep(3)
    d.get(B + "/management/student"); time.sleep(3.5)
    chk("수정 반영", any(f"QA학생{QA_TAG}수정" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")))
# 일괄 레벨/상태 변경
rows = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
tgt = [r for r in rows if f"QA학생{QA_TAG}수정" in n(r.text)]
if tgt:
    cb = tgt[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("일괄 레벨"); time.sleep(1.5)
        chk("일괄 변경 모달", len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0)
        lv = d.find_elements(By.CSS_SELECTOR, ".modal.show label[for*=SL03], .modal.show label[for*=userStatusLevel]")
        if lv: d.execute_script("arguments[0].click()", lv[0])
        time.sleep(0.5); click("적용", ".modal.show button"); time.sleep(4)
        d.get(B + "/management/student"); time.sleep(3.5)
        chk("일괄 변경 반영", any(f"QA학생{QA_TAG}수정" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")))
    # 삭제 — 원본 규칙: 정규회원은 바로 삭제 못 하고 휴회/예비로 바꾼 뒤 삭제
    rows = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
    tgt = [r for r in rows if f"QA학생{QA_TAG}수정" in n(r.text)]
    if tgt:
        cb = tgt[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("일괄"); time.sleep(1.5)
        for l in d.find_elements(By.CSS_SELECTOR, ".modal.show label"):
            if n(l.text) == "휴회": d.execute_script("arguments[0].click()", l); break
        time.sleep(0.4); click("적용", ".modal.show button", exact=True); time.sleep(4); alert_ok(); time.sleep(2.5)
        d.get(B + "/management/student"); time.sleep(3.5)
        rows = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
        tgt = [r for r in rows if f"QA학생{QA_TAG}수정" in n(r.text)]
        chk("휴회 학생 목록 유지", len(tgt) == 1, "휴회 후에도 목록에 남아야 한다")
    if tgt:
        cb = tgt[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("삭제", ".category-btns-item", exact=True); time.sleep(1.5)
        t = alert_text(); alert_ok(); time.sleep(3.5); alert_ok(); time.sleep(2.5)
        d.get(B + "/management/student"); time.sleep(3.5)
        chk("학생 삭제 반영", not any(f"QA학생{QA_TAG}수정" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")), t)

print("\n[B] 교사 등록 → 권한 → 삭제")
d.get(B + "/management/teacher"); time.sleep(3.5)
tbefore = len(d.find_elements(By.CSS_SELECTOR, "table tbody tr"))
click("교사 등록"); time.sleep(2.5)
for k, v in {"fromTel": f"QA교사{QA_TAG}", "stphone": "010", "midphone": "3333", "lastphone": "4444", "inputEmail": "qa@test.com", "inputID": f"qa{QA_TAG}", "inputPW": "qa123456", "inputPWcheck": "qa123456"}.items():
    fill("#" + k, v)
click("중복체크"); time.sleep(2.5); chk("아이디 중복체크", "사용" in alert_text() or "가능" in alert_text(), alert_text()); alert_ok(); time.sleep(0.8)
perm = d.find_elements(By.CSS_SELECTOR, ".permissions-list input[type=checkbox], .permissions input[type=checkbox]")
if perm: d.execute_script("arguments[0].click()", perm[0]); time.sleep(0.4)
click("저장하기"); time.sleep(4.5)
chk("교사 저장", "저장" in alert_text() or "완료" in alert_text(), alert_text()); alert_ok(); time.sleep(3)
d.get(B + "/management/teacher"); time.sleep(3.5)
chk("교사 목록 반영", any(f"QA교사{QA_TAG}" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")), f"{tbefore}행→{len(d.find_elements(By.CSS_SELECTOR,'table tbody tr'))}행")
rows = d.find_elements(By.CSS_SELECTOR, "table tbody tr")
tgt = [r for r in rows if f"QA교사{QA_TAG}" in n(r.text)]
if tgt:
    cb = tgt[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("삭제", ".category-btns-item", exact=True); time.sleep(1.5)
        t = alert_text(); alert_ok(); time.sleep(4)
        d.get(B + "/management/teacher"); time.sleep(3.5)
        chk("교사 삭제 반영", not any(f"QA교사{QA_TAG}" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")), t)

print("\n[C] 반 등록 → 학생 관리 → 삭제")
d.get(B + "/management/class"); time.sleep(3.5)
cbefore = len(d.find_elements(By.CSS_SELECTOR, "table tbody tr"))
click("반 등록"); time.sleep(2.5)
inp = d.find_elements(By.CSS_SELECTOR, ".manegment input[type=text]")
if inp: inp[0].clear(); inp[0].send_keys(f"QA반{QA_TAG}")
g = [l for l in d.find_elements(By.CSS_SELECTOR, ".filter-radio label") if n(l.text) == "고3"]
if g: d.execute_script("arguments[0].click()", g[0])
time.sleep(0.5); click("저장하기"); time.sleep(4.5)
chk("반 저장", "저장" in alert_text() or "완료" in alert_text(), alert_text()); alert_ok(); time.sleep(3)
d.get(B + "/management/class"); time.sleep(3.5)
chk("반 목록 반영", any(f"QA반{QA_TAG}" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")), f"{cbefore}행")
rows = [r for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr") if f"QA반{QA_TAG}" in n(r.text)]
if rows:
    cb = rows[0].find_elements(By.CSS_SELECTOR, "input[type=checkbox]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.5)
        click("삭제", ".category-btns-item", exact=True); time.sleep(1.5)
        t = alert_text(); alert_ok(); time.sleep(4)
        d.get(B + "/management/class"); time.sleep(3.5)
        chk("반 삭제 반영", not any(f"QA반{QA_TAG}" in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "table tbody tr")), t)

print("\n[D] 출결 입력 → 저장 → 재조회")
d.get(B + "/management/attendance"); time.sleep(4)
cells = d.find_elements(By.CSS_SELECTOR, "span[id^=spnCell_]")
chk("출결 그리드", len(cells) > 0, f"{len(cells)}셀")
if cells:
    cid = cells[0].get_attribute("id")
    before_cls = cells[0].get_attribute("class")
    d.execute_script("arguments[0].click()", cells[0]); time.sleep(0.6)
    mid_cls = d.find_element(By.ID, cid).get_attribute("class")
    chk("셀 상태 변경", before_cls != mid_cls, f"{before_cls} → {mid_cls}")
    click("저장", ".category-btns-item", exact=True); time.sleep(4)
    chk("출결 저장", "저장" in alert_text() or "완료" in alert_text(), alert_text()); alert_ok(); time.sleep(2)
    d.get(B + "/management/attendance"); time.sleep(4)
    after_cls = d.find_elements(By.ID, cid)
    chk("저장 후 재조회 유지", after_cls and after_cls[0].get_attribute("class") == mid_cls, after_cls[0].get_attribute("class") if after_cls else "없음")
    # 원복
    d.execute_script("const e=document.getElementById(arguments[0]); if(e){for(let i=0;i<4;i++) e.click();}", cid); time.sleep(1)
    click("저장", ".category-btns-item", exact=True); time.sleep(3.5); alert_ok()

print("\n[E] 교재 · 개별학생교재 · 통계 · 교실설정 · 프로필")
d.get(B + "/management/book"); time.sleep(3.5)
chk("교재 카드", len(d.find_elements(By.CSS_SELECTOR, ".card")) > 0, f"{len(d.find_elements(By.CSS_SELECTOR,'.card'))}개")
click("반 별 교재 관리"); time.sleep(4)
chk("교재 매핑 진입", "/book/mapping" in d.current_url, d.current_url[-40:])
d.get(B + "/management/individualstdbooks"); time.sleep(4)
click("개별 교재 선택"); time.sleep(2)
chk("개별 교재 선택 반응", bool(alert_text()) or len(d.find_elements(By.CSS_SELECTOR, ".modal.show")) > 0, alert_text())
alert_ok(); time.sleep(1)
d.get(B + "/management/statistic"); time.sleep(4)
tabs = d.find_elements(By.CSS_SELECTOR, ".list-tab--3 .nav-link")
if len(tabs) > 1:
    d.execute_script("arguments[0].click()", tabs[1]); time.sleep(2.5)
    chk("통계 탭 전환", "active" in (tabs[1].get_attribute("class") or ""))
menu = d.find_elements(By.CSS_SELECTOR, ".menu-board .nav-link")
if len(menu) > 1:
    d.execute_script("arguments[0].click()", menu[1]); time.sleep(2)
    chk("통계 메뉴 전환", "active" in (menu[1].get_attribute("class") or ""))
d.get(B + "/management/centerinfo"); time.sleep(3.5)
chk("전자세금계산서 정보 섹션", "세금계산서" in n(d.find_element(By.TAG_NAME, "body").text))
click("저장하기"); time.sleep(4)
chk("교실설정 저장", bool(alert_text()), alert_text()); alert_ok(); time.sleep(2)
d.get(B + "/mypage/profile"); time.sleep(3.5)
click("저장하기"); time.sleep(3.5)
chk("프로필 저장", bool(alert_text()), alert_text()); alert_ok(); time.sleep(1.5)
click("비밀번호 변경하기"); time.sleep(2)
chk("비밀번호 변경 화면", "비밀번호" in n(d.find_element(By.TAG_NAME, "body").text))
errs = [e["message"][:120] for e in d.get_log("browser") if e["level"] == "SEVERE" and "Failed to load resource" not in e["message"]]
chk("JS 오류 없음", len(errs) == 0, "; ".join(errs[:2]))
print("\n실패:", fails if fails else "없음")
d.quit()
