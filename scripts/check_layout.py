# 레이아웃 sanity: 본문 폭·좌표, 가로 오버플로, 상단 GNB, 빈 화면 여부
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
ROUTES=["/dashboard","/paper/mypaper","/paper/favorite","/paper/favoritequestion","/paper/share","/paper/theme","/paper/trash",
"/clinic/studentmark","/clinic/class","/clinic/report","/clinic/trash","/management/student","/management/studentform","/management/class",
"/management/teacher","/management/attendance","/management/book","/management/book/mapping","/management/statistic","/management/individualstdbooks",
"/management/centerinfo","/mypage/profile","/help/notice","/paper/make"]
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60); B="http://localhost:3777"
d.get(B+"/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
bad=0
for r in ROUTES:
    d.get(B+r); time.sleep(2.2)
    m=d.execute_script("""
    const c=document.querySelector('#contents')||document.querySelector('.contens-body');
    const cr=c?c.getBoundingClientRect():null;
    const h=document.querySelector('.contents-header__new');
    return {left:cr?Math.round(cr.left):null, width:cr?Math.round(cr.width):null,
            overflow: document.documentElement.scrollWidth-document.documentElement.clientWidth,
            header: h?Math.round(h.getBoundingClientRect().height):0,
            textLen: (document.body.innerText||'').trim().length};""")
    errs=[e for e in d.get_log("browser") if e["level"]=="SEVERE" and "Failed to load resource" not in e["message"]]
    flag=""
    if m["overflow"]>4: flag+=" [가로overflow %d]"%m["overflow"]
    if m["textLen"]<200: flag+=" [내용부족 %d]"%m["textLen"]
    if m["header"]<40: flag+=" [헤더없음]"
    if errs: flag+=" [JS %d]"%len(errs)
    if flag: bad+=1
    print(f"{r:34s} 본문 left={m['left']} w={m['width']} 헤더={m['header']} 글자={m['textLen']}{flag}")
print("문제 화면:",bad)
d.quit()
