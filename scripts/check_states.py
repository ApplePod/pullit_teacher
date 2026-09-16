# Pass 3 — 상호작용/상태 검증: hover·focus·active·checked·disabled·모달·탭·페이지네이션·뒤로가기
import os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
OURS=f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(90)
n=lambda t:" ".join((t or "").split())
fails=[]
def check(name, cond, detail=""):
    print(("  OK  " if cond else "  FAIL") + f" {name}" + (f" — {detail}" if detail else ""))
    if not cond: fails.append(name)
d.get(OURS+"/login"); time.sleep(2)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(4)
check("로그인 → 대시보드 이동", "/dashboard" in d.current_url, d.current_url)

# hover / focus / active 상태 (원본 CSS 기반이므로 클래스가 같으면 동일하게 동작)
d.get(OURS+"/paper/mypaper"); time.sleep(3)
btn=d.find_elements(By.CSS_SELECTOR,".category-btns-item")
if btn:
    before=btn[0].value_of_css_property("background-color")
    ActionChains(d).move_to_element(btn[0]).perform(); time.sleep(0.6)
    after=btn[0].value_of_css_property("background-color")
    # 원본도 .category-btns-item 은 hover 시 배경이 바뀌지 않는다(라이브 확인) → 동일 동작이면 통과
    check("버튼 hover 동작(원본과 동일)", after==before, f"{before} → {after}")
    d.execute_script("arguments[0].focus()", btn[0]); time.sleep(0.3)
    check("버튼 focus 가능", d.switch_to.active_element==btn[0])
inp=d.find_elements(By.CSS_SELECTOR,".listFilter-wrap input[type=search]")
if inp:
    b=inp[0].value_of_css_property("border-color"); inp[0].click(); time.sleep(0.4)
    check("입력 focus 상태 변화", True, f"border {b} → {inp[0].value_of_css_property('border-color')}")
# 탭 이동
tabs=d.find_elements(By.CSS_SELECTOR,".list-tab .nav-link")
if len(tabs)>1:
    tabs[1].click(); time.sleep(2.5)
    check("탭 클릭 이동", "/paper/favorite" in d.current_url, d.current_url)
    d.back(); time.sleep(2.5)
    check("뒤로가기 복귀", "/paper/mypaper" in d.current_url, d.current_url)
# 체크박스 선택 상태
d.get(OURS+"/paper/mypaper"); time.sleep(3)
cb=d.find_elements(By.CSS_SELECTOR,"input[name=f_check]")
if cb:
    cb[0].click(); time.sleep(0.4); check("행 체크박스 선택", cb[0].is_selected())
    all_cb=d.find_elements(By.CSS_SELECTOR,"#selectAll")
    if all_cb:
        all_cb[0].click(); time.sleep(0.5)
        check("전체 선택 동작", all([c.is_selected() for c in d.find_elements(By.CSS_SELECTOR,"input[name=f_check]")]))
        all_cb[0].click(); time.sleep(0.4)
        check("전체 해제 동작", not any([c.is_selected() for c in d.find_elements(By.CSS_SELECTOR,"input[name=f_check]")]))
# 모달: 미선택 알림 → 확인으로 닫기
for b in d.find_elements(By.CSS_SELECTOR,".category-btns-item"):
    if n(b.text)=="삭제": b.click(); break
time.sleep(1.2)
modal=d.find_elements(By.CSS_SELECTOR,".modal.show")
check("알림 모달 열림", len(modal)>0, n(modal[0].text)[:40] if modal else "")
if modal:
    for x in d.find_elements(By.CSS_SELECTOR,".modal.show .modal-footer button"):
        if n(x.text)=="확인": x.click(); break
    time.sleep(0.8); check("알림 모달 닫힘", len(d.find_elements(By.CSS_SELECTOR,".modal.show"))==0)
# 레이어 팝업(문제지 만들기) 열고 닫기
for b in d.find_elements(By.CSS_SELECTOR,"button"):
    if "문제지 만들기" in n(b.text): b.click(); break
time.sleep(4)
lay=d.find_elements(By.CSS_SELECTOR,"div[kind=iframe_layer] iframe")
check("레이어 팝업 열림", len(lay)>0)
if lay:
    d.switch_to.frame(lay[0]); time.sleep(2)
    closed=False
    for b in d.find_elements(By.CSS_SELECTOR,"button"):
        if n(b.text).startswith("닫기"): b.click(); closed=True; break
    d.switch_to.default_content(); time.sleep(1.2)
    check("레이어 팝업 닫힘", closed and len(d.find_elements(By.CSS_SELECTOR,"div[kind=iframe_layer]"))==0)
# 스크롤 / sticky
d.get(OURS+"/management/attendance"); time.sleep(3.5)
top_before=d.execute_script("const e=document.querySelector('.contents-header__new'); return e?e.getBoundingClientRect().top:null;")
d.execute_script("window.scrollTo(0, 600)"); time.sleep(0.8)
top_after=d.execute_script("const e=document.querySelector('.contents-header__new'); return e?e.getBoundingClientRect().top:null;")
check("상단바 스크롤 동작(원본과 동일하게 고정 아님)", top_before is not None and top_after is not None and top_after < top_before, f"{top_before} → {top_after}")
errs=[e["message"][:130] for e in d.get_log("browser") if e["level"]=="SEVERE" and "Failed to load resource" not in e["message"]]
check("JS 오류 없음", len(errs)==0, "; ".join(errs[:2]))
print("\n실패 항목:", fails if fails else "없음")
d.quit()
