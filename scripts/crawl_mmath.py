import json, os, re, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

BASE="https://new.mmath.co.kr"
OUT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적"
os.makedirs(OUT, exist_ok=True)
paths=[l.strip() for l in open("/private/tmp/claude-503/-Users-harry-Desktop-Claude-newlearn/f856cec8-14f5-4126-973e-b70298bbeda9/scratchpad/center_paths.txt") if l.strip()]
# 팝업/로그인 페이지 제외, 대시보드 진입점 추가
skip=('/Login/','/Popup/')
seeds=["/Pages/Center/"]+[p for p in paths if not any(s in p for s in skip)]

o=Options()
o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000"); o.add_argument("--hide-scrollbars")
o.set_capability("goog:loggingPrefs", {"performance":"ALL"})
d=webdriver.Chrome(options=o)
d.set_page_load_timeout(60)

def login():
    d.get(BASE+"/Pages/Center/Login/login.cshtml"); time.sleep(4)
    d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("17150%")
    d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("3386")
    d.find_element(By.CSS_SELECTOR,".btn-wrap button").click(); time.sleep(6)
    return "/login" not in d.current_url.lower()

def slug(p): return re.sub(r'[^A-Za-z0-9]+','_',p).strip('_').lower()

def apis_from_perf():
    eps=set()
    try:
        for entry in d.get_log("performance"):
            try:
                msg=json.loads(entry["message"])["message"]
                if msg["method"]=="Network.requestWillBeSent":
                    u=msg["params"]["request"]["url"]
                    m=re.search(r'/proc/[A-Za-z0-9_/.\-]+', u)
                    if m: eps.add(m.group(0).lower())
            except: pass
    except: pass
    return sorted(eps)

def inventory():
    js=r"""
    const q=s=>[...document.querySelectorAll(s)];
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
    return {
      title: (document.querySelector('.contents-header h2, #contents h2')||{}).innerText||document.title,
      tabs: q('.list-tab .nav-link, .contents-header__gnb a').filter(vis).map(b=>b.innerText.trim()).filter(Boolean),
      buttons: q('button, a.button__line, a.btn, .button__fill').filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,30), oc:(b.getAttribute('onclick')||'').slice(0,120), cls:(b.className||'').slice(0,60)})).filter(x=>x.t||x.oc),
      inputs: q('#contents input, #contents select, #contents textarea').filter(vis).map(i=>({name:i.name||i.id||'', type:i.type||i.tagName.toLowerCase(), ph:i.placeholder||''})),
      tables: q('#contents table thead').map(t=>[...t.querySelectorAll('th')].map(th=>th.innerText.trim())),
      counts: {buttons:q('button').length, forms:q('form').length, modals:q('.modal').length},
    };"""
    return d.execute_script(js)

if not login():
    print("LOGIN FAILED", flush=True); sys.exit(1)
print("LOGIN ok", flush=True)

index=[]
for i,p in enumerate(seeds):
    url=BASE+p
    try:
        d.get_log("performance")  # flush
        d.get(url); time.sleep(4.5)
        # 팝업/모달/채팅 숨기기
        d.execute_script("document.querySelectorAll('[id^=div_layer_pop],.modal,.modal-backdrop,#ch-plugin,[id^=ch-]').forEach(e=>e.style.display=\"none\")")
        time.sleep(0.5)
        s=slug(p)
        d.save_screenshot(f"{OUT}/{s}.png")
        html=d.execute_script("return (document.querySelector('#contents')||document.body).outerHTML")
        html=re.sub(r'<script.*?</script>','',html,flags=re.S)
        open(f"{OUT}/{s}.html","w").write(html)
        meta=inventory(); meta["path"]=p; meta["url"]=d.current_url; meta["apis"]=apis_from_perf(); meta["slug"]=s
        open(f"{OUT}/{s}.json","w").write(json.dumps(meta,ensure_ascii=False,indent=1))
        index.append({"path":p,"slug":s,"title":meta.get("title"),"apis":len(meta["apis"]),"buttons":len(meta["buttons"]),"tabs":meta.get("tabs")})
        print(f"[{i+1}/{len(seeds)}] {p} · api {len(meta['apis'])} · btn {len(meta['buttons'])}", flush=True)
    except Exception as e:
        print(f"[{i+1}/{len(seeds)}] ERR {p}: {str(e)[:100]}", flush=True)
        index.append({"path":p,"error":str(e)[:100]})
open(f"{OUT}/_index.json","w").write(json.dumps(index,ensure_ascii=False,indent=1))
print(f"DONE pages={len(seeds)}", flush=True)
d.quit()
