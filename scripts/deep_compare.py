# 원본(라이브 로그인) vs 우리 구현 — DOM 구조·치수·타이포·색·테두리까지 전수 대조
# 사용: python3 scripts/deep_compare.py <cookie> [viewport...]   예) ... 1440 1280
import sys, time, json, os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

COOKIE = sys.argv[1]
_args = sys.argv[2:]
VIEWPORTS = [int(x) for x in _args if x.isdigit()] or [1440]
FILTER = [x for x in _args if not x.isdigit()]          # 예: /paper /clinic
OURS_PORT = os.environ.get("OURS_PORT", "3777")
LIVE = "https://new.mmath.co.kr"
OURS = f"http://localhost:{os.environ.get('OURS_PORT', '3777')}"
PAGES = [
    ("/Pages/Center/", "/dashboard"),
    ("/Pages/Center/Paper/mypaper.cshtml", "/paper/mypaper"),
    ("/Pages/Center/Paper/favorite.cshtml", "/paper/favorite"),
    ("/Pages/Center/Paper/favoriteQuestion.cshtml", "/paper/favoritequestion"),
    ("/Pages/Center/Paper/share.cshtml", "/paper/share"),
    ("/Pages/Center/Paper/trash.cshtml", "/paper/trash"),
    ("/Pages/Center/Clinic/studentmark.cshtml", "/clinic/studentmark"),
    ("/Pages/Center/Clinic/class.cshtml", "/clinic/class"),
    ("/Pages/Center/Clinic/report.cshtml", "/clinic/report"),
    ("/Pages/Center/Clinic/trash.cshtml", "/clinic/trash"),
    ("/Pages/Center/Management/student.cshtml", "/management/student"),
    ("/Pages/Center/Management/studentForm.cshtml", "/management/studentform"),
    ("/Pages/Center/Management/class.cshtml", "/management/class"),
    ("/Pages/Center/Management/teacher.cshtml", "/management/teacher"),
    ("/Pages/Center/Management/attendance.cshtml", "/management/attendance"),
    ("/Pages/Center/Management/book.cshtml", "/management/book"),
    ("/Pages/Center/Management/statistic.cshtml", "/management/statistic"),
    ("/Pages/Center/Management/individualStdBooks.cshtml", "/management/individualstdbooks"),
    ("/Pages/Center/Management/centerinfo.cshtml", "/management/centerinfo"),
    ("/Pages/Center/Mypage/profile.cshtml", "/mypage/profile"),
]
if FILTER:
    PAGES = [p for p in PAGES if any(f in p[1] for f in FILTER)]

# 데이터(행/카드 내용)는 학원마다 달라 비교 대상에서 제외하고, 화면 골격만 본다
COLLECT = """
const props = ["display","position","marginTop","marginBottom","marginLeft","marginRight",
 "paddingTop","paddingBottom","paddingLeft","paddingRight","borderTopWidth","borderBottomWidth",
 "borderLeftWidth","borderRightWidth","borderTopColor","borderRadius","boxShadow","backgroundColor",
 "color","fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textAlign","gap",
 "flexDirection","justifyContent","alignItems","gridTemplateColumns","opacity","overflowX","overflowY","zIndex"];
const SKIP = /table-body|tbody|marsonry-question-item|dashboard__notice|dashboard__review|slide-box|null-item/;
const root = document.body;
const base = document.querySelector('#contents');
const bx = base ? base.getBoundingClientRect() : {left:0, top:0};
const out = {};
const counts = {};
const walk = (el, path, depth) => {
  if (depth > 6) return;
  for (const c of el.children) {
    const tag = c.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'noscript') continue;
    const cls = (c.className && c.className.toString ? c.className.toString() : '').trim().split(/\\s+/).filter(Boolean).slice(0,3).join('.');
    const r = c.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;   // 숨겨진 요소(모달·구버전 잔재)는 제외
    const key = path + '>' + tag + (cls ? '.' + cls : '');
    counts[key] = (counts[key] || 0) + 1;
    const fullKey = key + '#' + counts[key];
    {
      const s = getComputedStyle(c);
      const o = {w: Math.round(r.width), h: Math.round(r.height),
                 x: Math.round(r.left - bx.left), y: Math.round(r.top + scrollY - (bx.top + scrollY))};
      for (const p of props) o[p] = s[p];
      if (tag === 'img') { o.src = (c.getAttribute('src')||'').split('/').pop(); o.natural = c.naturalWidth + 'x' + c.naturalHeight; }
      out[fullKey] = o;
    }
    if (!SKIP.test(cls)) walk(c, fullKey, depth + 1);
  }
};
walk(root, '', 0);
return out;"""

def parse_cookies(path):
    out = []
    for line in open(path):
        if line.startswith("#") or not line.strip(): continue
        p = line.strip().split("\t")
        if len(p) >= 7: out.append({"name": p[5], "value": p[6], "domain": p[0].lstrip("."), "path": p[2]})
    return out

NUM = {"w","h","x","y"}
IGNORE_VAL = {"fontFamily"}  # 폰트 패밀리는 따로 검사(로컬 폴백 문자열 차이)

def diff(a, b):
    """원본 a 와 우리 b 의 차이 목록"""
    res = []
    keys = [k for k in a if k in b]
    for k in keys:
        for prop, av in a[k].items():
            bv = b[k].get(prop)
            if bv is None: continue
            if prop in NUM:
                if abs(av - bv) <= 1: continue
                # 데이터량에 따라 달라지는 세로 치수·위치는 별도 표시
            elif av == bv: continue
            res.append((k, prop, av, bv))
    missing = [k for k in a if k not in b]
    extra = [k for k in b if k not in a]
    return res, missing, extra

o = Options(); o.add_argument("--headless=new")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(120)
cookies = parse_cookies(COOKIE)

def live_profile(path, w):
    d.set_window_size(w, 1200)
    d.get(LIVE + path); time.sleep(3.5)
    return d.execute_script(COLLECT)

def our_profile(path, w):
    d.set_window_size(w, 1200)
    d.get(OURS + path); time.sleep(3.0)
    return d.execute_script(COLLECT)

report = {}
for vw in VIEWPORTS:
    print(f"\n{'='*70}\n  VIEWPORT {vw}px\n{'='*70}")
    # 라이브 먼저 (쿠키 필요)
    d.delete_all_cookies()
    d.set_window_size(vw, 1200)
    d.get(LIVE + "/favicon.ico"); time.sleep(0.4)
    for c in cookies:
        try: d.add_cookie(c)
        except Exception: pass
    # 라이브는 세션 첫 페이지에서 사이드바 확장 스크립트가 돌아 #contents 클래스가 달라진다 → 대시보드로 먼저 흡수
    live_profile("/Pages/Center/", vw)
    live = {op: live_profile(lp, vw) for lp, op in PAGES}
    # 우리
    d.delete_all_cookies()
    d.get(OURS + "/login"); time.sleep(1.5)
    d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
    d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
    d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(3)
    for lp, op in PAGES:
        ours = our_profile(op, vw)
        ds, missing, extra = diff(live[op], ours)
        # 세로(y/h) 차이는 데이터량 영향이 크므로 분리
        layout = [x for x in ds if x[1] in ("w","x")]
        vert = [x for x in ds if x[1] in ("h","y")]
        style = [x for x in ds if x[1] not in NUM]
        report.setdefault(vw, {})[op] = dict(layout=len(layout), vert=len(vert), style=len(style), missing=len(missing), extra=len(extra))
        print(f"\n## {op}  (가로/위치 {len(layout)} · 세로 {len(vert)} · 스타일 {len(style)} · 원본에만 {len(missing)} · 우리만 {len(extra)})")
        for k, p, av, bv in (layout + style + vert)[:60]:
            print(f"   {k[-58:]:58s} {p:18s} 원본 {str(av)[:22]:22s} 우리 {str(bv)[:22]}")
        for k in missing: print(f"   [원본에만] {k}")
        for k in extra:   print(f"   [우리에만] {k}")
d.quit()
print("\n\n요약:", json.dumps(report, ensure_ascii=False)[:1500])
