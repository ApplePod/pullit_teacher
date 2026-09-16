import json, os, re, time, sys, traceback
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

BASE="https://new.mmath.co.kr"
OUT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적/actions"
os.makedirs(OUT, exist_ok=True)
paths=[l.strip() for l in open("/private/tmp/claude-503/-Users-harry-Desktop-Claude-newlearn/f856cec8-14f5-4126-973e-b70298bbeda9/scratchpad/center_paths.txt") if l.strip()]
skip=('/Login/','/Popup/','/shared/','/Premium/MathOperations/popup','pop.')
pages=["/Pages/Center/"]+[p for p in paths if not any(s in p for s in skip)]

# 데이터 변경 가능성이 있는 버튼은 절대 누르지 않음
DANGER=re.compile(r'저장|발송|전송|결제|삭제|해지|탈퇴|로그아웃|복원|일괄|변경|등록하기|신청|업로드|다운|인쇄|출력|엑셀|초기화|재전송|승인|취소요청|제출|배정하기|채점 저장|임시 저장|처음부터|QR|키패드|원격|매뉴얼|고객센터', re.I)
DANGER_OC=re.compile(r'del|save|send|pay|remove|logout|restore|excel|print|upload|submit|reset', re.I)

o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000"); o.add_argument("--hide-scrollbars")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60)

def login():
    d.get(BASE+"/Pages/Center/Login/login.cshtml"); time.sleep(4)
    d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("17150%")
    d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("3386")
    d.find_element(By.CSS_SELECTOR,".btn-wrap button").click(); time.sleep(6)
    return "/login" not in d.current_url.lower()

def slug(p): return re.sub(r'[^A-Za-z0-9]+','_',p).strip('_').lower()
def hide_noise():
    d.execute_script("document.querySelectorAll('[id^=div_layer_pop],#ch-plugin,[id^=ch-]').forEach(e=>e.style.display=\"none\")")

STYLE_JS=r"""
const e=arguments[0]; const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
const pick=['backgroundColor','color','border','borderRadius','padding','fontSize','fontWeight','fontFamily','lineHeight','height','width','boxShadow','textAlign','display'];
const st={}; pick.forEach(k=>st[k]=cs[k]);
return {tag:e.tagName.toLowerCase(), text:(e.innerText||e.value||'').trim().slice(0,40), cls:e.className&&typeof e.className==='string'?e.className:'', id:e.id||'', href:e.getAttribute('href')||'', onclick:(e.getAttribute('onclick')||'').slice(0,160), rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, style:st,
 iconHtml:(e.querySelector('i,span.material-symbols-sharp')||{}).outerHTML||''};
"""
CLICKABLES_JS=r"""
const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'};
const q=[...document.querySelectorAll('#contents button, #contents a, #contents label[for], #contents .accordion-button, #contents .nav-link, #contents .chip, #contents input[type=radio]+label')];
const seen=new Set(); const out=[];
for(const e of q){ if(!vis(e)) continue; const key=(e.innerText||'').trim()+'|'+e.className+'|'+(e.getAttribute('onclick')||'')+'|'+(e.getAttribute('href')||''); if(seen.has(key)) continue; seen.add(key); e.setAttribute('data-ac', out.length); out.push(out.length); }
return out.length;
"""
STATE_JS=r"""
const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'};
const modals=[...document.querySelectorAll('.modal.show, .modal[style*="display: block"], [role=dialog], .layer-popup, .popup_wrap, .popup-wrap, .iframe-popup, #layerPop, .modal-dialog')].filter(vis);
const iframes=[...document.querySelectorAll('iframe')].filter(vis).map(f=>f.src);
const acc=[...document.querySelectorAll('.accordion-collapse.show, .collapse.show')].length;
const m=modals[0];
return {url:location.href, modalCount:modals.length, modalHtml: m? m.outerHTML.slice(0,60000):'', modalText: m? (m.innerText||'').slice(0,800):'', iframes, accOpen:acc, contentsLen:(document.querySelector('#contents')||document.body).innerHTML.length};
"""

def state(): return d.execute_script(STATE_JS)
def close_overlays():
    # ESC, 닫기/취소 버튼, 백드롭
    try: d.find_element(By.TAG_NAME,"body").send_keys(Keys.ESCAPE)
    except: pass
    time.sleep(0.4)
    d.execute_script("""
      for(const b of document.querySelectorAll('.modal.show button, .modal.show a, [role=dialog] button, .popup_wrap a, .layer-popup button, button.btn-close, .btn-close__photo')){
        const t=(b.innerText||'').trim(); if(/닫기|취소|close|×|Close/.test(t)||b.classList.contains('btn-close')){ try{b.click();}catch(e){} }
      }
      document.querySelectorAll('.modal-backdrop').forEach(e=>e.remove());
      document.querySelectorAll('.modal.show').forEach(e=>{e.classList.remove('show'); e.style.display='none';});
      document.body.classList.remove('modal-open');
    """)
    time.sleep(0.4)

if not login(): print("LOGIN FAILED", flush=True); sys.exit(1)
print("LOGIN ok", flush=True)

summary=[]
for pi,p in enumerate(pages):
    url=BASE+p; s=slug(p); pdir=f"{OUT}/{s}"; os.makedirs(pdir, exist_ok=True)
    try:
        d.get(url); time.sleep(4); hide_noise()
    except Exception as e:
        print(f"[{pi+1}/{len(pages)}] ERR load {p}: {str(e)[:80]}", flush=True); continue
    base_url=d.current_url
    try: n=d.execute_script(CLICKABLES_JS)
    except Exception as e: n=0
    actions=[]
    for i in range(n):
        try:
            el=d.find_element(By.CSS_SELECTOR,f'[data-ac="{i}"]')
        except: continue
        try: info=d.execute_script(STYLE_JS, el)
        except: continue
        text=info.get('text',''); oc=info.get('onclick',''); href=info.get('href','')
        rec={"i":i, **info, "action":"skipped"}
        # 위험 버튼·외부링크·이동 링크(다른 페이지)는 클릭 안 함(모양만 기록)
        if DANGER.search(text) or DANGER_OC.search(oc) or href.startswith('http') or href.startswith('mailto'):
            rec["action"]="not_clicked(danger/external)"; actions.append(rec); continue
        before=state()
        try:
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", el); time.sleep(0.2)
            el.click(); time.sleep(1.6)
        except Exception as e:
            rec["action"]=f"click_error:{str(e)[:60]}"; actions.append(rec); continue
        try: d.switch_to.alert.dismiss(); rec["alert"]=True
        except: pass
        after=state()
        changed = after["url"]!=before["url"] or after["modalCount"]>before["modalCount"] or after["iframes"]!=before["iframes"] or after["accOpen"]!=before["accOpen"] or abs(after["contentsLen"]-before["contentsLen"])>200
        rec["after"]={"url":after["url"],"modalCount":after["modalCount"],"iframes":after["iframes"],"accOpen":after["accOpen"],"modalText":after["modalText"]}
        if changed:
            rec["action"]="changed"
            shot=f"{pdir}/act_{i:02d}.png"; d.save_screenshot(shot); rec["shot"]=os.path.basename(shot)
            if after["modalHtml"]:
                open(f"{pdir}/act_{i:02d}_modal.html","w").write(after["modalHtml"]); rec["modal_html"]=f"act_{i:02d}_modal.html"
            if after["iframes"]:
                # iframe 내부도 캡처
                try:
                    fr=d.find_elements(By.TAG_NAME,"iframe")
                    for k,f in enumerate(fr[:2]):
                        d.switch_to.frame(f); time.sleep(1.5)
                        html=d.execute_script("return document.body.outerHTML")
                        open(f"{pdir}/act_{i:02d}_iframe{k}.html","w").write(html)
                        d.save_screenshot(f"{pdir}/act_{i:02d}_iframe{k}.png")
                        d.switch_to.default_content()
                except Exception: d.switch_to.default_content()
            # 원복
            if after["url"]!=before["url"]:
                rec["after"]["navigated_html_len"]=after["contentsLen"]
                try:
                    html=d.execute_script("return (document.querySelector('#contents')||document.body).outerHTML")
                    open(f"{pdir}/act_{i:02d}_page.html","w").write(html)
                except: pass
                d.get(base_url); time.sleep(3); hide_noise()
                try: d.execute_script(CLICKABLES_JS)
                except: pass
            else:
                close_overlays()
        else:
            rec["action"]="no_visible_change"
        actions.append(rec)
    json.dump(actions, open(f"{pdir}/actions.json","w"), ensure_ascii=False, indent=1)
    ch=sum(1 for a in actions if a["action"]=="changed")
    summary.append({"path":p,"slug":s,"buttons":len(actions),"changed":ch})
    print(f"[{pi+1}/{len(pages)}] {p} · 버튼 {len(actions)} · 반응 {ch}", flush=True)

json.dump(summary, open(f"{OUT}/_summary.json","w"), ensure_ascii=False, indent=1)
print("DONE", flush=True); d.quit()
