import json, glob, re, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
SRC="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적"
LOCAL="http://localhost:3777"
INV=r"""
const q=s=>[...document.querySelectorAll(s)];
const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
const norm=t=>(t||'').replace(/\s+/g,' ').trim();
return {
 tabs: q('.list-tab .nav-link').filter(vis).map(b=>norm(b.innerText)).filter(Boolean),
 buttons: q('#contents button, #contents a.button__line, #contents a.btn, #contents .button__fill').filter(vis).map(b=>norm(b.innerText)).filter(Boolean),
 inputs: q('#contents input, #contents select, #contents textarea').filter(vis).map(i=>i.name||i.id||i.placeholder||'').filter(Boolean),
 ths: q('#contents table thead th').filter(vis).map(t=>norm(t.innerText)).filter(Boolean),
};"""
def path_to_route(p):
    m=re.search(r'/Pages/Center/(.+?)\.cshtml', p, re.I)
    if not m: return "/dashboard" if p.rstrip('/').lower().endswith('/center') else None
    return "/"+m.group(1).lower()
SKIP=('/Login/','/Popup/','/shared/','Dashboard/index','Dashboard/trial','makestudy','/popup/','pop.','MathOperations/direct','result.excel','studentform')
def jacc(a,b):
    a=set(a); b=set(b)
    if not a and not b: return 1.0
    if not a or not b: return 0.0
    return len(a&b)/len(a|b)

o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o)
d.get(LOCAL+"/login"); time.sleep(3)
d.find_element(By.NAME,"email").send_keys("admin"); d.find_element(By.NAME,"password").send_keys("admin1")
d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(4)

rows=[]
for f in sorted(glob.glob(f"{SRC}/*.json")):
    if f.endswith("_index.json"): continue
    orig=json.load(open(f)); p=orig["path"]
    if any(s in p for s in SKIP): continue
    route=path_to_route(p)
    if not route: continue
    try:
        d.get(LOCAL+route); time.sleep(1.8)
        ours=d.execute_script(INV)
    except Exception as e:
        rows.append((route,0,0,0,0,f"ERR {str(e)[:40]}")); continue
    ob=[b['t'].replace('\n',' ').strip() for b in orig.get('buttons',[]) if b.get('t')]
    oi=[ (i['name'] or i['ph']) for i in orig.get('inputs',[]) if (i.get('name') or i.get('ph'))]
    ot=[c for t in orig.get('tables',[]) for c in t if c]
    GNB={'문제지 보관함','채점&클리닉','프리미엄','관리'}
    otabs=[x for x in orig.get('tabs',[]) if x not in GNB]
    st=jacc(ours['tabs'], otabs)
    sb=jacc(ours['buttons'], ob)
    si=jacc(ours['inputs'], oi)
    sh=jacc(ours['ths'], ot)
    rows.append((route, round(st,2), round(sb,2), round(si,2), round(sh,2), ""))
d.quit()
rows.sort(key=lambda r: (sum(r[1:5])/4) if isinstance(r[1],(int,float)) else -1)
print(f"{'route':40} tab  btn  inp  th   avg")
tot=0
for r in rows:
    avg=sum(r[1:5])/4
    tot+=avg
    print(f"{r[0]:40} {r[1]:<4} {r[2]:<4} {r[3]:<4} {r[4]:<4} {avg:.2f}  {r[5]}")
print(f"\n평균 일치율: {tot/len(rows):.2%}  ({len(rows)}개 화면)")
