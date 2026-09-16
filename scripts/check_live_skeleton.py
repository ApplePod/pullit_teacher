# 라이브 원본(로그인) 전체 페이지 vs 우리 화면 — #contents 골격(태그+클래스 시퀀스) 비교
import re, time, json, subprocess, sys, os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
COOKIE=sys.argv[1] if len(sys.argv)>1 else "/tmp/live_cookies.txt"
LIVE="https://new.mmath.co.kr"
PAIRS=[("/paper/mypaper","/Pages/Center/Paper/mypaper.cshtml"),("/paper/favorite","/Pages/Center/Paper/favorite.cshtml"),
("/paper/favoritequestion","/Pages/Center/Paper/favoriteQuestion.cshtml"),("/paper/share","/Pages/Center/Paper/share.cshtml"),
("/paper/trash","/Pages/Center/Paper/trash.cshtml"),("/clinic/studentmark","/Pages/Center/Clinic/studentmark.cshtml"),
("/clinic/class","/Pages/Center/Clinic/class.cshtml"),("/clinic/report","/Pages/Center/Clinic/report.cshtml"),
("/clinic/trash","/Pages/Center/Clinic/trash.cshtml"),("/management/student","/Pages/Center/Management/student.cshtml"),
("/management/class","/Pages/Center/Management/class.cshtml"),("/management/teacher","/Pages/Center/Management/teacher.cshtml"),
("/management/attendance","/Pages/Center/Management/attendance.cshtml"),("/management/book","/Pages/Center/Management/book.cshtml"),
("/management/statistic","/Pages/Center/Management/statistic.cshtml"),("/management/individualstdbooks","/Pages/Center/Management/individualStdBooks.cshtml"),
("/management/centerinfo","/Pages/Center/Management/centerinfo.cshtml"),("/mypage/profile","/Pages/Center/Mypage/profile.cshtml"),
("/management/studentform","/Pages/Center/Management/studentForm.cshtml")]
KEY=re.compile(r'(list-tab|listFilter|category-btns|table-head|table-body|table-default-list|table-rollcall|pagination|alert-orange|filter-radio|filter-check|search-input|search-select|period-btn|btn-underline|accordion|card-grid|learning-tree|list-basic-check|manegment|templete|sum-board|menu-board|right-tab|mark-header|count-student|list-setting)')
def live_classes(html):
    html=re.sub(r'<script.*?</script>','',html,flags=re.S); html=re.sub(r'<!--.*?-->','',html,flags=re.S)
    i=html.find('id="contents"')
    if i<0: i=html.find('contens-body')
    seg=html[i:]
    out=[]
    for m in re.finditer(r'class="([^"]+)"', seg):
        for c in m.group(1).split():
            if KEY.search(c): out.append(c)
    return out
JS="""
const root=document.querySelector('#contents')||document.body; const out=[];
root.querySelectorAll('[class]').forEach(e=>{ (e.className.baseVal||e.className||'').split(/\\s+/).forEach(c=>{ if(c) out.push(c); }); });
return out;"""
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60); B="http://localhost:3777"
d.get(B+"/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
tot_missing=0
for ours,live in PAIRS:
    html=subprocess.run(["curl","-s","-b",COOKIE,LIVE+live,"--max-time","40"],capture_output=True,text=True).stdout
    lc=live_classes(html)
    d.get(B+ours); time.sleep(2.4)
    oc=[c for c in d.execute_script(JS) if KEY.search(c)]
    lset, oset = set(lc), set(oc)
    missing=sorted(lset-oset); extra=sorted(oset-lset)
    tot_missing+=len(missing)
    print(f"{ours:32s} 원본클래스 {len(lset):3d} / 우리 {len(oset):3d} · 누락 {len(missing)}")
    if missing: print("    누락:", ", ".join(missing[:12]))
    if extra:   print("    추가:", ", ".join(extra[:8]))
print("총 누락 클래스:", tot_missing)
d.quit()
