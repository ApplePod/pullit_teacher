# 로그인 화면 원본 대조 (비로그인 상태)
import os, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
OURS=f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
JS="""
const props=["display","position","width","height","margin","padding","backgroundColor","color","fontFamily","fontSize","fontWeight","lineHeight","borderRadius","boxShadow","border","textAlign","gap"];
const out={};
const sels=["header.detail","header.detail .header-wrap","header.detail .logo","main.Login","main.Login section",
 ".Benner",".Benner .Profile",".Benner .Profile img",".Benner .Text-wrap",".Benner .Text-wrap span",".Benner .Button-wrap",".Benner .Button-wrap button",
 ".Form",".Form h2",".Form .form-input-basic",".Form .form-input-basic input",".Form .input-basic-2",".Checkbox-wrap",".Checkbox-wrap label",".Checkbox-wrap .custom-checkbox",
 ".Checkbox-wrap a",".btn-wrap",".btn-wrap button",".Links-wrap",".Links-wrap a"];
for(const s of sels){ const e=document.querySelector(s); if(!e){ out[s]=null; continue; }
  const r=e.getBoundingClientRect(); const c=getComputedStyle(e); const o={w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)};
  for(const p of props) o[p]=c[p]; out[s]=o; }
out["__texts"]=[...document.querySelectorAll("h2,label,button,a,span,input")].map(e=>e.tagName+":"+((e.innerText||e.placeholder||"").replace(/\\s+/g," ").trim()).slice(0,26)).filter(t=>t.split(":")[1]);
return out;"""
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(90)
d.get("https://new.mmath.co.kr/Pages/Center/Login/login.cshtml"); time.sleep(4); live=d.execute_script(JS)
d.get(OURS+"/login"); time.sleep(3); ours=d.execute_script(JS)
n=0
for k,v in live.items():
    if k=="__texts":
        if v!=ours.get(k): print("텍스트 차이\n  원본:",v,"\n  우리:",ours.get(k)); n+=1
        continue
    w=ours.get(k)
    if v is None and w is None: continue
    if v is None or w is None: print(f"{k:34s} 존재 원본={v is not None} 우리={w is not None}"); n+=1; continue
    for p,val in v.items():
        ov=w.get(p)
        if p in ("w","h","x","y"):
            if abs(val-ov)<=1: continue
        elif val==ov: continue
        print(f"{k:34s} {p:16s} 원본 {str(val)[:26]:26s} 우리 {str(ov)[:26]}"); n+=1
print("로그인 차이:", n)
errs=[e["message"][:120] for e in d.get_log("browser") if e["level"]=="SEVERE"]
print("JS 오류:", len(errs)); [print("   ",x) for x in errs[:5]]
d.quit()
