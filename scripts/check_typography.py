# 원본 vs 우리 — 폰트 패밀리/크기/굵기/자간/행간 및 로그인 화면 비교
import os, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
COOKIE = sys.argv[1]
OURS = f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
SEL = ["body", "#contents", ".contens-body", ".list-tab .nav-link", ".category-btns-item",
       ".listFilter-title", ".table-head li", "h2", "h3", "h5", "h6", ".alert-orange",
       ".button__line", ".form-control", "select", ".contents-header__gnb a", ".f-12", ".f-14", ".fw-700"]
JS = """
const out={};
for (const s of arguments[0]) {
  const e=document.querySelector(s); if(!e) { out[s]=null; continue; }
  const c=getComputedStyle(e);
  out[s]=[c.fontFamily, c.fontSize, c.fontWeight, c.lineHeight, c.letterSpacing, c.color, c.textAlign];
}
return out;"""
def parse(path):
    out=[]
    for line in open(path):
        if line.startswith("#") or not line.strip(): continue
        p=line.strip().split("\t")
        if len(p)>=7: out.append({"name":p[5],"value":p[6],"domain":p[0].lstrip("."),"path":p[2]})
    return out
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(120)
d.get("https://new.mmath.co.kr/favicon.ico"); time.sleep(0.4)
for c in parse(COOKIE):
    try: d.add_cookie(c)
    except Exception: pass
PAIRS=[("/Pages/Center/Paper/mypaper.cshtml","/paper/mypaper"),("/Pages/Center/Management/student.cshtml","/management/student"),("/Pages/Center/","/dashboard")]
live={}
for lp,op in PAIRS:
    d.get("https://new.mmath.co.kr"+lp); time.sleep(3.2); live[op]=d.execute_script(JS, SEL)
# 로그인 화면(비로그인)
d.delete_all_cookies()
d.get("https://new.mmath.co.kr/Pages/Center/Login/login.cshtml"); time.sleep(3)
live_login=d.execute_script("""
const g=(s)=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
 return [Math.round(r.width),Math.round(r.height),c.fontFamily.split(',')[0],c.fontSize,c.backgroundColor];};
return {body:g('body'), form:g('.Form'), banner:g('.Benner'), input:g('input'), btn:g('button'),
        texts:[...document.querySelectorAll('h1,h2,h3,label,button,a')].map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,14),
        imgs:[...document.images].map(i=>i.getAttribute('src')).slice(0,8)};""")
d.get(OURS+"/login"); time.sleep(2.5)
our_login=d.execute_script("""
const g=(s)=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
 return [Math.round(r.width),Math.round(r.height),c.fontFamily.split(',')[0],c.fontSize,c.backgroundColor];};
return {body:g('body'), form:g('.Form'), banner:g('.Benner'), input:g('input'), btn:g('button'),
        texts:[...document.querySelectorAll('h1,h2,h3,label,button,a')].map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,14),
        imgs:[...document.images].map(i=>i.getAttribute('src')).slice(0,8)};""")
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
print("=== 타이포그래피 차이")
n=0
for lp,op in PAIRS:
    d.get(OURS+op); time.sleep(2.5)
    ours=d.execute_script(JS, SEL)
    for s in SEL:
        L,O=live[op].get(s), ours.get(s)
        if L is None or O is None:
            if (L is None)!=(O is None): print(f"  {op:22s} {s:22s} 존재 원본={L is not None} 우리={O is not None}"); n+=1
            continue
        if L!=O:
            for i,name in enumerate(["family","size","weight","line","spacing","color","align"]):
                if L[i]!=O[i]: print(f"  {op:22s} {s:22s} {name:8s} 원본 {str(L[i])[:34]:34s} 우리 {str(O[i])[:34]}"); n+=1
print("타이포 차이:", n)
print("\n=== 로그인 화면")
for k in live_login:
    if live_login[k]!=our_login.get(k): print(f"  {k}\n     원본 {live_login[k]}\n     우리 {our_login.get(k)}")
d.quit()
