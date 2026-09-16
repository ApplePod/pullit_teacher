# 내부 링크 전수 확인 (깨진 링크 없는지)
import os, time, urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
B = os.environ.get("BASE", "https://pullit-teacher.vercel.app")
ROUTES=["/dashboard","/paper/mypaper","/paper/favorite","/paper/favoritequestion","/paper/share","/paper/trash","/paper/theme",
"/clinic/studentmark","/clinic/class","/clinic/report","/clinic/trash","/management/student","/management/studentform","/management/class",
"/management/teacher","/management/attendance","/management/book","/management/statistic","/management/individualstdbooks","/management/centerinfo",
"/mypage/profile","/mypage/calculate","/help/notice","/help/faq","/help/dataroom","/help/11qna","/help/errreport","/premium/video"]
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(120)
d.get(B+"/login"); time.sleep(2.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(4)
links=set()
for r in ROUTES:
    d.get(B+r); time.sleep(1.5)
    for h in d.execute_script("return [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))"):
        if not h or h.startswith(("#","javascript:","mailto:","tel:","http")): continue
        links.add(h.split("?")[0])
print("내부 링크", len(links), "개 확인")
cookies = {c["name"]: c["value"] for c in d.get_cookies()}
import requests
s=requests.Session(); s.cookies.update(cookies)
bad=[]
for l in sorted(links):
    try:
        code=s.get(B+l, timeout=30, allow_redirects=False).status_code
    except Exception as e:
        code=f"ERR {e}"
    if code not in (200,307,308,302):
        bad.append((l,code))
for l,c in bad: print(f"  깨짐 {c}  {l}")
print("깨진 링크:", len(bad))
d.quit()
