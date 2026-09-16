import json, os, re, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
BASE="https://new.mmath.co.kr"; OUT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적/paper"; os.makedirs(OUT, exist_ok=True)
PIDS=["27284039","27304819"]
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1300,1000"); o.add_argument("--hide-scrollbars")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(90)
def login():
    d.get(BASE+"/Pages/Center/Login/login.cshtml"); time.sleep(4)
    d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("17150%"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("3386")
    d.find_element(By.CSS_SELECTOR,".btn-wrap button").click(); time.sleep(6); return "/login" not in d.current_url.lower()
TYPO=r"""
const pick=['fontFamily','fontSize','lineHeight','letterSpacing','marginTop','marginBottom','marginLeft','paddingLeft','paddingTop','color','fontWeight','width','textIndent'];
const sels=['#div2columnpapercontent','.page_template','.paper_header','.divpaper','.divcolumn','.barcolumn','.divproblem','.numbering','.divquestion','.edkparagraph','.divchoice','.divchoice li','.divchoice li .edkparagraph','.divanswer','.divexplain','.exam_attr_wrap','.paper_cover','.page_footer','.spnpaging'];
const out={};
for(const s of sels){ const e=document.querySelector(s); if(e){const cs=getComputedStyle(e);const st={};pick.forEach(k=>st[k]=cs[k]); const r=e.getBoundingClientRect(); out[s]={style:st,rect:{w:Math.round(r.width),h:Math.round(r.height)},cls:(typeof e.className==='string'?e.className:''),attrs:[...e.attributes].map(a=>a.name+'='+a.value).slice(0,12),text:(e.innerText||'').trim().slice(0,60)} } }
out._links=[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href);
out._fonts=[...new Set([...document.querySelectorAll('.divproblem *')].slice(0,300).map(e=>getComputedStyle(e).fontFamily))].slice(0,10);
out._page={w:document.body.scrollWidth,h:document.body.scrollHeight, cols:document.querySelectorAll('.divcolumn').length, problems:document.querySelectorAll('.divproblem').length, pages:document.querySelectorAll('.page_template').length};
return out;"""
def capture(name):
    time.sleep(2)
    d.save_screenshot(f"{OUT}/{name}.png")
    # 전체 높이 스크린샷
    h=d.execute_script("return Math.min(document.body.scrollHeight, 6000)")
    d.set_window_size(1300, max(1000,h)); time.sleep(1); d.save_screenshot(f"{OUT}/{name}_full.png"); d.set_window_size(1300,1000)
    html=d.execute_script("return document.documentElement.outerHTML"); html=re.sub(r'<script.*?</script>','',html,flags=re.S)
    open(f"{OUT}/{name}.html","w").write(html)
    json.dump(d.execute_script(TYPO), open(f"{OUT}/{name}_typo.json","w"), ensure_ascii=False, indent=1)
    print("cap", name, flush=True)
if not login(): print("LOGIN FAILED", flush=True); sys.exit(1)
print("LOGIN ok", flush=True)
for pid in PIDS:
    # 1) 인쇄용 (GET)
    try:
        d.get(f"{BASE}/pages/bank/printpaper?f_paper_list={pid}"); time.sleep(8)
        # iframe 안에 실제 시험지가 있을 수 있음
        frs=d.find_elements(By.TAG_NAME,"iframe")
        capture(f"print_{pid}_outer")
        for k,f in enumerate(frs[:3]):
            try:
                d.switch_to.frame(f); time.sleep(4); capture(f"print_{pid}_iframe{k}")
                # 인쇄 옵션 라벨(문제/정답/해설/빠른정답 등) 클릭 캡처 — 데이터 변경 없음
                labels=[l for l in d.find_elements(By.CSS_SELECTOR,"label, .btn, button") if l.is_displayed() and re.search(r'정답|해설|문제|빠른|2단|1단|여백|폰트|크기|템플릿', l.text or '')]
                seen=set()
                for l in labels[:14]:
                    t=(l.text or '').strip()
                    if not t or t in seen or re.search(r'인쇄|저장|다운|닫기|출력', t): continue
                    seen.add(t)
                    try: l.click(); time.sleep(1.5); capture(f"print_{pid}_iframe{k}_opt_{re.sub(r'[^가-힣A-Za-z0-9]','',t)[:12]}")
                    except Exception as e: print("opt err", t, str(e)[:50], flush=True)
                d.switch_to.default_content()
            except Exception as e:
                print("iframe err", str(e)[:80], flush=True); d.switch_to.default_content()
    except Exception as e: print("print err", str(e)[:80], flush=True)
    # 2) 미리보기 (POST previewpaper)
    try:
        d.get(BASE+"/Pages/Center/Paper/mypaper.cshtml"); time.sleep(4)
        d.execute_script("""
          const f=document.createElement('form'); f.method='POST'; f.action='/pages/bank/previewpaper';
          const add=(k,v)=>{const i=document.createElement('input'); i.name=k; i.value=v; f.appendChild(i)};
          add('f_paper_id', arguments[0]); add('f_openpreview_yn','Y'); add('f_previewonly_yn','Y');
          document.body.appendChild(f); f.submit();""", pid)
        time.sleep(9); capture(f"preview_{pid}_outer")
        frs=d.find_elements(By.TAG_NAME,"iframe")
        for k,f in enumerate(frs[:3]):
            try: d.switch_to.frame(f); time.sleep(4); capture(f"preview_{pid}_iframe{k}"); d.switch_to.default_content()
            except Exception as e: print("prev iframe err", str(e)[:60], flush=True); d.switch_to.default_content()
    except Exception as e: print("preview err", str(e)[:80], flush=True)
print("DONE", flush=True); d.quit()
