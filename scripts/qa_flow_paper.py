# 깊이 있는 흐름 QA — 문제지 영역(만들기 3종·배정·인쇄·즐겨찾기·공유·휴지통·문항 즐겨찾기)
import os, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

B = os.environ.get("BASE", f"http://localhost:{os.environ.get('OURS_PORT','3777')}")
o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1500,1100")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(150)
n = lambda t: " ".join((t or "").split())
fails = []
def chk(name, cond, detail=""):
    print(("  OK  " if cond else "  FAIL") + f" {name}" + (f" — {detail}" if detail else ""))
    if not cond: fails.append(name)
def btn(text, css="button", exact=False, root=None):
    for b in (root or d).find_elements(By.CSS_SELECTOR, css):
        t = n(b.text)
        if (t == text) if exact else (text in t):
            try: d.execute_script("arguments[0].scrollIntoView({block:'center'})", b); b.click(); return True
            except Exception:
                try: d.execute_script("arguments[0].click()", b); return True
                except Exception: return False
    return False
def modal_text():
    e = d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-body")
    return n(e[0].text)[:70] if e else ""
def modal_ok():
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-footer button"):
        if n(x.text) in ("확인", "저장", "적용", "배정하기"): d.execute_script("arguments[0].click()", x); return True
    return False
def modal_close():
    for x in d.find_elements(By.CSS_SELECTOR, ".modal.show .modal-footer button.cancel, .modal.show .btn-close"):
        d.execute_script("arguments[0].click()", x); return True
    return False
def layer_close():
    d.execute_script("window.postMessage({ptClosePopup:true},'*')"); time.sleep(1)

d.get(B + "/login"); time.sleep(2.5)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(4)

print("\n[A] 문제지 만들기 — 직접 출제 끝까지")
d.get(B + "/paper/mypaper"); time.sleep(3.5)
btn("문제지 만들기"); time.sleep(5)          # 원본처럼 레이어 팝업으로 연다
_fr = d.find_elements(By.CSS_SELECTOR, "div[kind=iframe_layer] iframe")
chk("마법사 레이어", len(_fr) > 0)
d.switch_to.frame(_fr[0]); time.sleep(2.5)
d.execute_script("document.querySelector('label[for=\"radio111-02\"]').click()"); time.sleep(2)
chk("직접 출제 선택", d.execute_script("const b=document.querySelector('#radio111-02'); return !!(b&&b.checked)"))
btn("다음"); time.sleep(3)
chk("문항 조회 단계", len(d.find_elements(By.CSS_SELECTOR, ".marsonry-question-list")) > 0)
btn("검색", exact=True); time.sleep(4)
cbs = d.find_elements(By.CSS_SELECTOR, ".marsonry-question-item input[type=checkbox]")
chk("문항 조회 결과", len(cbs) > 0, f"{len(cbs)}개")
for c in cbs[:4]: d.execute_script("arguments[0].click()", c); time.sleep(0.2)
chk("문항 선택 표시", "선택" in n(d.find_element(By.TAG_NAME, "body").text))
btn("다음"); time.sleep(5)
chk("프린트 설정 진입", len(d.find_elements(By.CSS_SELECTOR, "#tplStep3Right")) > 0)
sh = d.find_elements(By.CSS_SELECTOR, ".pt-sheet-host iframe")
chk("프린트 설정 미리보기", len(sh) > 0)
if sh:
    d.switch_to.frame(sh[0]); time.sleep(3)
    cnt = len(d.find_elements(By.CSS_SELECTOR, ".divproblem"))
    chk("미리보기 문항 수", cnt == 4, f"{cnt}문항")
    d.switch_to.parent_frame()   # 시험지 iframe → 마법사 프레임으로 복귀
# 프린트 설정 옵션 변경(탭/라디오)
tabs = d.find_elements(By.CSS_SELECTOR, "#tplStep3Right .nav-link")
if tabs:
    d.execute_script("arguments[0].click()", tabs[-1]); time.sleep(1)
    chk("프린트 설정 탭 전환", "active" in (tabs[-1].get_attribute("class") or ""))
btn("다음"); time.sleep(9)
done = d.find_elements(By.CSS_SELECTOR, "#tplStep4Main")
chk("만들기 완료", len(done) > 0, n(done[0].text)[:60] if done else "")
chk("완료 화면 버튼 4종", len(d.find_elements(By.CSS_SELECTOR, "#tplStep4Main button")) == 4)
# 완료 화면에서 미리보기 → 중첩 레이어
btn("미리보기"); time.sleep(1)
d.switch_to.default_content(); time.sleep(5)
lays = d.find_elements(By.CSS_SELECTOR, "div[kind=iframe_layer]")
chk("완료 화면 → 미리보기 중첩 레이어", len(lays) >= 2, f"레이어 {len(lays)}")
layer_close(); time.sleep(1); layer_close()

print("\n[B] 내 문제지 — 배정 → 채점 대기까지")
d.get(B + "/paper/mypaper"); time.sleep(3.5)
rows = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
chk("목록에 새 문제지 반영", len(rows) >= 1, f"{len(rows)}행")
if rows:
    cb = rows[0].find_elements(By.CSS_SELECTOR, "input[name=f_check]")
    if cb: d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.4)
    btn("학생 배정"); time.sleep(5)
    fr = d.find_elements(By.CSS_SELECTOR, "div[kind=iframe_layer] iframe")
    chk("학생 배정 팝업", len(fr) > 0)
    if fr:
        d.switch_to.frame(fr[0]); time.sleep(2.5)
        stds = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[type=checkbox]")
        chk("배정 대상 학생 목록", len(stds) > 0, f"{len(stds)}명")
        for c in stds[:2]: d.execute_script("arguments[0].click()", c)
        time.sleep(0.5)
        btn("반별 선택"); time.sleep(1.5)
        chk("반별 탭 전환", len(d.find_elements(By.CSS_SELECTOR, ".learning-tree__body > li")) > 0)
        btn("학생별 선택"); time.sleep(1.2)
        btn("배정하기"); time.sleep(3.5)
        chk("배정 완료 알림", "배정" in modal_text(), modal_text())
        modal_ok(); time.sleep(2)
        d.switch_to.default_content(); layer_close()

print("\n[C] 즐겨찾기 · 공유 토글")
d.get(B + "/paper/mypaper"); time.sleep(3)
rows = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
if rows:
    icon = rows[0].find_elements(By.CSS_SELECTOR, "i.on-off-bookmark")
    if icon:
        before = icon[0].get_attribute("class")
        d.execute_script("arguments[0].click()", icon[0]); time.sleep(3)
        after = d.find_elements(By.CSS_SELECTOR, "ul.table-body")[0].find_element(By.CSS_SELECTOR, "i.on-off-bookmark").get_attribute("class")
        chk("즐겨찾기 아이콘 토글", before != after, f"{before} → {after}")
    d.get(B + "/paper/favorite"); time.sleep(3)
    chk("즐겨찾기 목록 반영", len(d.find_elements(By.CSS_SELECTOR, "ul.table-body")) >= 1)
    d.get(B + "/paper/mypaper"); time.sleep(3)
    icon = d.find_elements(By.CSS_SELECTOR, "ul.table-body i.on-off-bookmark")
    if icon: d.execute_script("arguments[0].click()", icon[0]); time.sleep(3)

print("\n[D] 문항 즐겨찾기 — 폴더 생성 → 담기 → 개수 → 삭제")
d.get(B + "/paper/favoritequestion"); time.sleep(3)
before_rows = len(d.find_elements(By.CSS_SELECTOR, "ul.table-body"))
btn("문항 즐겨찾기 만들기"); time.sleep(1.2)
inp = d.find_elements(By.CSS_SELECTOR, ".modal.show input[type=text]")
chk("폴더 만들기 모달", len(inp) > 0)
if inp:
    inp[0].send_keys("QA폴더")
    btn("저장", ".modal.show button", exact=True); time.sleep(3.5)
    rows2 = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
    chk("폴더 생성", len(rows2) == before_rows + 1, f"{before_rows} → {len(rows2)}")
    if rows2:
        d.execute_script("arguments[0].click()", rows2[0].find_element(By.CSS_SELECTOR, "a")); time.sleep(5)
        fr = d.find_elements(By.CSS_SELECTOR, "div[kind=iframe_layer] iframe")
        chk("문항 담기 팝업", len(fr) > 0)
        if fr:
            d.switch_to.frame(fr[0]); time.sleep(2.5)
            btn("검색", exact=True); time.sleep(4)
            cbs = d.find_elements(By.CSS_SELECTOR, ".marsonry-question-item input[type=checkbox]")
            for c in cbs[:3]: d.execute_script("arguments[0].click()", c)
            time.sleep(0.5)
            btn("저장", exact=True); time.sleep(3.5)
            chk("문항 저장 알림", "저장" in modal_text(), modal_text())
            modal_ok(); time.sleep(2)
            d.switch_to.default_content(); layer_close(); time.sleep(2)
        d.get(B + "/paper/favoritequestion"); time.sleep(3)
        txt = n(d.find_elements(By.CSS_SELECTOR, "ul.table-body")[0].text) if d.find_elements(By.CSS_SELECTOR, "ul.table-body") else ""
        chk("문항 수 반영", "3문항" in txt, txt[:50])
        # 정리: 폴더 삭제
        cb = d.find_elements(By.CSS_SELECTOR, "ul.table-body input[name=f_check]")
        if cb:
            d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.4)
            btn("삭제", ".category-btns-item", exact=True); time.sleep(1.2)
            modal_ok(); time.sleep(3)
            chk("폴더 삭제", len(d.find_elements(By.CSS_SELECTOR, "ul.table-body")) == before_rows)

print("\n[E] 휴지통 왕복")
d.get(B + "/paper/mypaper"); time.sleep(3)
rows = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
if rows:
    name0 = n(rows[0].text)[:18]
    cb = rows[0].find_elements(By.CSS_SELECTOR, "input[name=f_check]")
    if cb:
        d.execute_script("arguments[0].click()", cb[0]); time.sleep(0.4)
        btn("삭제", ".category-btns-item", exact=True); time.sleep(1.2)
        chk("삭제 확인창", "삭제" in modal_text(), modal_text())
        modal_ok(); time.sleep(3.5)
        d.get(B + "/paper/trash"); time.sleep(3)
        tr = d.find_elements(By.CSS_SELECTOR, "ul.table-body")
        chk("휴지통에 들어감", len(tr) >= 1, f"{len(tr)}행")
        if tr:
            cb2 = tr[0].find_elements(By.CSS_SELECTOR, "input[name=f_check]")
            if cb2:
                d.execute_script("arguments[0].click()", cb2[0]); time.sleep(0.4)
                btn("복원하기"); time.sleep(3.5)
                d.get(B + "/paper/mypaper"); time.sleep(3)
                chk("복원 후 목록 복귀", any(name0[:10] in n(r.text) for r in d.find_elements(By.CSS_SELECTOR, "ul.table-body")))
errs = [e["message"][:120] for e in d.get_log("browser") if e["level"] == "SEVERE" and "Failed to load resource" not in e["message"]]
chk("JS 오류 없음", len(errs) == 0, "; ".join(errs[:2]))
print("\n실패:", fails if fails else "없음")
d.quit()
