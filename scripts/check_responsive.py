# 원본 vs 우리 — 뷰포트별 가로 오버플로·헤더/본문 폭·JS 오류
import os, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
COOKIE = sys.argv[1]
VPS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]
PAGES = [("/Pages/Center/", "/dashboard"), ("/Pages/Center/Paper/mypaper.cshtml", "/paper/mypaper"),
         ("/Pages/Center/Management/student.cshtml", "/management/student")]
OURS = f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
JS = """
const d=document.documentElement;
const h=document.querySelector('.contents-header__new'); const c=document.querySelector('#contents'); const b=document.querySelector('.contens-body');
const g=(e)=>{ if(!e) return null; const r=e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.left)]; };
return {overflow: d.scrollWidth - d.clientWidth, header: g(h), contents: g(c), body: g(b),
        bodyFont: getComputedStyle(document.body).fontFamily.split(',')[0], scrollW: d.scrollWidth};"""
def parse(path):
    out=[]
    for line in open(path):
        if line.startswith("#") or not line.strip(): continue
        p=line.strip().split("\t")
        if len(p)>=7: out.append({"name":p[5],"value":p[6],"domain":p[0].lstrip("."),"path":p[2]})
    return out
o=Options(); o.add_argument("--headless=new")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(120)
cookies=parse(COOKIE)
d.get("https://new.mmath.co.kr/favicon.ico"); time.sleep(0.4)
for c in cookies:
    try: d.add_cookie(c)
    except Exception: pass
live={}
for vw in VPS:
    d.set_window_size(vw, 900)
    for lp, op in PAGES:
        d.get("https://new.mmath.co.kr"+lp); time.sleep(3)
        live[(vw,op)]=d.execute_script(JS)
d.delete_all_cookies()
d.set_window_size(1440,900); d.get(OURS+"/login"); time.sleep(2)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
print(f"{'뷰포트':>6} {'화면':22s} {'항목':10s} {'원본':>22s} {'우리':>22s}")
bad=0
for vw in VPS:
    d.set_window_size(vw, 900)
    for lp, op in PAGES:
        d.get_log("browser")   # 라이브에서 남은 로그 비우기
        d.get(OURS+op); time.sleep(2.5)
        ours=d.execute_script(JS)
        L=live[(vw,op)]
        errs=[e for e in d.get_log("browser") if e["level"]=="SEVERE" and "Failed to load resource" not in e["message"]]
        for k in ["overflow","header"]:   # 세로 치수는 데이터량 영향 → 가로/오버플로/헤더만 비교
            if L[k]!=ours[k]:
                print(f"{vw:6d} {op:22s} {k:10s} {str(L[k]):>22s} {str(ours[k]):>22s}"); bad+=1
        if errs: print(f"{vw:6d} {op:22s} JS오류 {len(errs)}: {errs[0]['message'][:80]}"); bad+=1
print("차이/오류 합계:", bad)
d.quit()
