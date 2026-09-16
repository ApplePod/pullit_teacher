# 라이브 원본 화면과 우리 화면의 실제 배치(여백·크기·좌표)를 나란히 비교
import sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

COOKIE = sys.argv[1]
LIVE = "https://new.mmath.co.kr"
PAGES = [("/Pages/Center/","/dashboard"),("/Pages/Center/Paper/mypaper.cshtml","/paper/mypaper"),("/Pages/Center/Clinic/studentmark.cshtml","/clinic/studentmark"),("/Pages/Center/Management/student.cshtml","/management/student"),("/Pages/Center/Management/attendance.cshtml","/management/attendance"),("/Pages/Center/Mypage/profile.cshtml","/mypage/profile")]
OURS = "http://localhost:3777"

SELECTORS = [
    "#contents", ".contents-header", ".contents-header__wrap", ".contens-body",
    ".alert.alert-blue", ".list-tab", ".list-tab .nav-link",
    ".contents-body-dashboard", ".grid-main", ".dashboard__status", ".dashboard__status--body",
    ".dashboard__status--card", ".dashboard__status--card .card-body", ".dashboard__status--card .card-footer",
    ".advice", ".advice .card", ".quick-menu", ".dashboard__notice", ".dashboard__review",
    ".section-title", "h2", "h5", "h6",
]
JS = """
const out = {};
for (const sel of arguments[0]) {
  const e = document.querySelector(sel);
  if (!e) { out[sel] = null; continue; }
  const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
  out[sel] = { top: Math.round(r.top + window.scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
               mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, pb: s.paddingBottom,
               gap: s.gap, fs: s.fontSize, lh: s.lineHeight, bg: s.backgroundColor, radius: s.borderRadius,
               n: document.querySelectorAll(sel).length };
}
return out;"""

def snap(d, url, cookies=None):
    if cookies:
        d.get(LIVE + "/favicon.ico"); time.sleep(0.5)
        for c in cookies: 
            try: d.add_cookie(c)
            except Exception: pass
    d.get(url); time.sleep(4)
    try: d.execute_script("window.scrollTo(0,0)")
    except Exception: pass
    return d.execute_script(JS, SELECTORS)

def parse_cookies(path):
    out=[]
    for line in open(path):
        if line.startswith("#") or not line.strip(): continue
        p=line.strip().split("\t")
        if len(p)>=7: out.append({"name":p[5],"value":p[6],"domain":p[0].lstrip("."),"path":p[2]})
    return out

o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1200")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(90)
cookies = parse_cookies(COOKIE)
live_all = {}
for lp, op in PAGES:
    live_all[op] = snap(d, LIVE + lp, cookies if not live_all else None)
d.delete_all_cookies()
d.get(OURS + "/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(3)
ours_all = {op: snap(d, OURS + op) for _, op in PAGES}
KEYS = ["top","left","w","h","mt","mb","pt","pb","gap","fs","lh"]
diffs = 0
for op in [o for _, o in PAGES]:
    live, ours = live_all[op], ours_all[op]
    print(f"\n## {op}")
    for sel in SELECTORS:
        L, O = live.get(sel), ours.get(sel)
        if L is None or O is None: continue
        if L["w"] == 0 and L["h"] == 0: continue  # 원본에서 숨겨진 요소(구버전 잔재)는 비교 제외
        for k in KEYS:
            lv, ov = L[k], O[k]
            if isinstance(lv,(int,float)) and isinstance(ov,(int,float)):
                if abs(lv-ov) <= 2: continue
            elif lv == ov: continue
            print(f"   {sel:38s} {k:4s} 원본 {str(lv):>16s} / 우리 {str(ov):>16s}"); diffs += 1
print("차이 항목:", diffs)
d.quit()
