import json, os, re, time, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
BASE="https://new.mmath.co.kr"
OUT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적/wizard"; os.makedirs(OUT, exist_ok=True)
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1100"); o.add_argument("--hide-scrollbars")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60)
def login():
    d.get(BASE+"/Pages/Center/Login/login.cshtml"); time.sleep(4)
    d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("17150%")
    d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("3386")
    d.find_element(By.CSS_SELECTOR,".btn-wrap button").click(); time.sleep(6)
    return "/login" not in d.current_url.lower()
def hide(): d.execute_script("document.querySelectorAll('[id^=div_layer_pop],#ch-plugin,[id^=ch-]').forEach(e=>e.style.display=\"none\")")
def cap(name):
    d.save_screenshot(f"{OUT}/{name}.png")
    html=d.execute_script("return (document.querySelector('#contents')||document.body).outerHTML")
    html=re.sub(r'<script.*?</script>','',html,flags=re.S)
    open(f"{OUT}/{name}.html","w").write(html)
    # 보이는 컨트롤 스타일 스냅샷
    ctl=d.execute_script(r"""
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&getComputedStyle(e).display!=='none'};
      const pick=['backgroundColor','color','border','borderRadius','padding','fontSize','fontWeight','lineHeight','height','width'];
      return [...document.querySelectorAll('#contents button, #contents label, #contents .accordion-button, #contents select, #contents input[type=text], #contents input[type=number]')].filter(vis).slice(0,120).map(e=>{const cs=getComputedStyle(e);const st={};pick.forEach(k=>st[k]=cs[k]);return {tag:e.tagName.toLowerCase(),text:(e.innerText||e.value||e.placeholder||'').trim().slice(0,30),cls:(typeof e.className==='string'?e.className:''),style:st}});
    """)
    json.dump(ctl, open(f"{OUT}/{name}_controls.json","w"), ensure_ascii=False, indent=1)
    print("cap", name, flush=True)
def click_label(txt):
    els=d.find_elements(By.XPATH, f"//label[normalize-space()='{txt}']")
    for e in els:
        try:
            if e.is_displayed(): d.execute_script("arguments[0].scrollIntoView({block:'center'})",e); e.click(); time.sleep(1.5); return True
        except: pass
    return False
def click_btn(txt):
    els=d.find_elements(By.XPATH, f"//button[contains(normalize-space(),'{txt}')]")
    for e in els:
        try:
            if e.is_displayed() and e.is_enabled(): d.execute_script("arguments[0].scrollIntoView({block:'center'})",e); e.click(); time.sleep(2); return True
        except: pass
    return False

if not login(): print("LOGIN FAILED", flush=True); sys.exit(1)
print("LOGIN ok", flush=True)

# ===== A. 문제지 만들기 마법사 =====
d.get(BASE+"/Pages/Center/makestudy/makestudy.cshtml"); time.sleep(5); hide()
cap("w00_initial")
for i,m in enumerate(["자동 출제","직접 출제","교재매칭"]):
    if click_label(m): cap(f"w01_method_{i}_{m.replace(' ','')}")
# 자동 출제 → 학습종류 각각
click_label("자동 출제"); time.sleep(1)
for i,k in enumerate(["기본학습","개념/유형 학습","대입기출","학생별 맞춤","오답집중 학습","유형집중 학습"]):
    if click_label(k): cap(f"w02_kind_{i}_{k.replace('/','_').replace(' ','')}")
# 기본학습으로 두고 다음 단계 진행(저장류는 절대 X)
click_label("기본학습"); time.sleep(1)
# 단원 선택 팝업/버튼
if click_btn("단원 선택"): cap("w03_unit_select")
# 아코디언 전부 펼치기
d.execute_script("document.querySelectorAll('.accordion-collapse').forEach(e=>e.classList.add('show'))"); time.sleep(1)
cap("w04_all_expanded")
# '다음' 반복
for step in range(1,7):
    if not click_btn("다음"): break
    hide(); cap(f"w05_next_{step}")
# 직접 출제 경로도 다음 단계
d.get(BASE+"/Pages/Center/makestudy/makestudy.cshtml"); time.sleep(5); hide()
click_label("직접 출제"); time.sleep(1.5); cap("w06_direct_0")
for step in range(1,6):
    if not click_btn("다음"): break
    hide(); cap(f"w06_direct_next_{step}")
# 교재매칭 경로
d.get(BASE+"/Pages/Center/makestudy/makestudy.cshtml"); time.sleep(5); hide()
click_label("교재매칭"); time.sleep(1.5); cap("w07_book_0")
for step in range(1,5):
    if not click_btn("다음"): break
    hide(); cap(f"w07_book_next_{step}")

# ===== B. 문제지 미리보기/인쇄 포맷 =====
d.get(BASE+"/Pages/Center/Paper/mypaper.cshtml"); time.sleep(5); hide()
cap("p00_mypaper")
links=d.execute_script(r"""
  return [...document.querySelectorAll('#contents a, #contents button')].map(e=>({t:(e.innerText||'').trim().slice(0,20),oc:(e.getAttribute('onclick')||''),href:e.getAttribute('href')||'',cls:typeof e.className==='string'?e.className:''})).filter(x=>/viewpaper|printpaper|preview|bank|new|미리|새창|편집|pid=/i.test(x.oc+x.href+x.cls+x.t));
""")
json.dump(links, open(f"{OUT}/p01_paper_links.json","w"), ensure_ascii=False, indent=1)
print("paper links:", len(links), flush=True)
# 첫 문제지 URL 추출
urls=set()
for l in links:
    for m in re.findall(r"(/Pages/bank/[A-Za-z0-9_.]+\?[^'\")]+)", l["oc"]+" "+l["href"]): urls.add(m)
print("bank urls:", list(urls)[:5], flush=True)
for j,u in enumerate(list(urls)[:4]):
    try:
        d.get(BASE+u); time.sleep(6)
        d.save_screenshot(f"{OUT}/p10_bank_{j}.png")
        html=d.execute_script("return document.documentElement.outerHTML"); html=re.sub(r'<script.*?</script>','',html,flags=re.S)
        open(f"{OUT}/p10_bank_{j}.html","w").write(html)
        # 문항 텍스트 타이포 수치
        typo=d.execute_script(r"""
          const pick=['fontFamily','fontSize','lineHeight','letterSpacing','marginTop','marginBottom','paddingLeft','color','fontWeight'];
          const sel=['.question','.problem','.problem-text','.q-text','.paper-item','.item','p','td','.choice','.choices li','li','.qnum','.num'];
          const out={};
          for(const s of sel){ const e=[...document.querySelectorAll(s)].find(x=>x.innerText&&x.innerText.trim().length>5); if(e){const cs=getComputedStyle(e);const st={};pick.forEach(k=>st[k]=cs[k]); out[s]={text:e.innerText.trim().slice(0,40),style:st,cls:typeof e.className==='string'?e.className:''}} }
          out._links=[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href);
          out._pageW=document.body.scrollWidth; out._pageH=document.body.scrollHeight;
          return out;""")
        json.dump(typo, open(f"{OUT}/p10_bank_{j}_typo.json","w"), ensure_ascii=False, indent=1)
        print("bank cap", j, u[:60], flush=True)
    except Exception as e: print("bank err", str(e)[:80], flush=True)
print("DONE", flush=True); d.quit()
