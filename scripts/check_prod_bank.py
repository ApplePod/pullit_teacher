# 문제은행 구조 개편(1~3단계) 프로덕션 스모크 테스트 — 읽기 전용(데이터 생성 없음)
#   BASE=https://pullit-teacher.vercel.app python3 scripts/check_prod_bank.py
import os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

B = os.environ.get("BASE", "https://pullit-teacher.vercel.app")
o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1400,1000")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(90)
fails = []


def ck(name, cond, detail=""):
    print(("  OK   " if cond else "  FAIL ") + name + (" — " + str(detail) if detail else ""))
    if not cond:
        fails.append(name)


def wait_text(sel, want, sec=40):
    """sel 에 해당하는 요소 중 want 를 담은 텍스트가 나올 때까지 대기."""
    last = ""
    for _ in range(sec * 2):
        for e in d.find_elements(By.CSS_SELECTOR, sel):
            try:
                t = e.text
            except Exception:
                continue
            if want in t:
                return t
            last = last or t
        time.sleep(0.5)
    return last


def search_count(sec=60):
    """검색 버튼을 누르고, 비동기 조회가 끝나 건수가 갱신될 때까지 기다린 뒤 건수를 돌려준다.
    '검색 결과 N건' 문구는 검색 전에도 떠 있으므로 값이 바뀔 때까지 기다려야 한다."""
    before = wait_text(".f-12.bw5", "검색 결과")
    d.execute_script("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='검색').click()")
    for _ in range(sec * 2):
        now = wait_text(".f-12.bw5", "검색 결과")
        if now and now != before and d.find_elements(By.CSS_SELECTOR, ".marsonry-question-item"):
            return int("".join(c for c in now.split("건")[0] if c.isdigit()) or 0)
        time.sleep(0.5)
    return 0


print(f"[프로덕션 문제은행 스모크] {B}")
d.get(B + "/login"); time.sleep(2)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(4)
ck("로그인", "/login" not in d.current_url, d.current_url)

# 직접 출제 화면으로 이동 (기본 설정 → 출제방식 '직접 출제' → 다음)
d.get(B + "/paper/make"); time.sleep(4)
d.execute_script("document.querySelector('label[for=radio111-02]').click()"); time.sleep(1)
d.execute_script("[...document.querySelectorAll('.stepper a')][1].click()"); time.sleep(3)
ck("직접 출제 문항 조회 진입", bool(d.find_elements(By.CSS_SELECTOR, "#dt-short_answer")))

# 1단계 — 단답형(주관식) 필터
d.execute_script("document.querySelector('label[for=dt-short_answer]').click()"); time.sleep(0.5)
short_total = search_count()
ck("단답형 필터 결과 건수", short_total == 3877, f"{short_total}건")

cards = d.find_elements(By.CSS_SELECTOR, ".marsonry-question-item")
ck("단답형 문항 카드 렌더", len(cards) > 0, f"{len(cards)}개")
ck("단답형은 선택지 없음", all(not c.find_elements(By.CSS_SELECTOR, ".divchoice") for c in cards[:5]))

# 3단계 — 쌍둥이 문항 패널
d.execute_script("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='쌍둥이 문항').click()")
head = wait_text(".accordion-button", "쌍둥이 문항 ·")
twin_n = int("".join(c for c in head.split("·")[-1] if c.isdigit()) or 0)
ck("쌍둥이 문항 패널", twin_n > 0, f"{twin_n}개")

# 객관식 필터로 되돌려 총계 확인
d.execute_script("document.querySelector('label[for=dt-multiple_choice]').click()"); time.sleep(0.5)
mc_total = search_count()
ck("객관식 필터 결과 건수", mc_total == 5981, f"{mc_total}건")

errs = [e["message"][:140] for e in d.get_log("browser")
        if e["level"] == "SEVERE" and "Failed to load resource" not in e["message"]]
ck("JS 오류 없음", not errs, errs[:2])

d.quit()
print("\n실패:", ", ".join(fails) if fails else "없음")
raise SystemExit(1 if fails else 0)
