# 원본 안내문(.alert-orange / .alert-blue)과 우리 화면 비교
import re,time,html as H
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
SRC="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적"
MAP={"/clinic/studentmark":"pages_center_clinic_studentmark_cshtml","/clinic/class":"pages_center_clinic_class_cshtml","/clinic/report":"pages_center_clinic_report_cshtml","/clinic/trash":"pages_center_clinic_trash_cshtml",
"/management/teacher":"pages_center_management_teacher_cshtml","/management/class":"pages_center_management_class_cshtml","/management/attendance":"pages_center_management_attendance_cshtml","/management/book":"pages_center_management_book_cshtml",
"/management/statistic":"pages_center_management_statistic_cshtml","/management/individualstdbooks":"pages_center_management_individualstdbooks_cshtml","/management/centerinfo":"pages_center_management_centerinfo_cshtml",
"/management/student":"pages_center_management_student_cshtml","/paper/mypaper":"pages_center_paper_mypaper_cshtml","/paper/favorite":"pages_center_paper_favorite_cshtml","/paper/share":"pages_center_paper_share_cshtml","/paper/trash":"pages_center_paper_trash_cshtml","/paper/favoritequestion":"pages_center_paper_favoritequestion_cshtml"}
def notes(h):
    out=[]
    for m in re.finditer(r'<p[^>]*class="[^"]*alert-orange[^"]*"[^>]*>(.*?)</p>', h, re.S):
        t=re.sub(r'<[^>]+>','',m.group(1)); t=" ".join(H.unescape(t).split())
        if t and "{{" not in t: out.append(t)
    return out
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60); B="http://localhost:3777"
d.get(B+"/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
miss=0
for route,slug in MAP.items():
    orig=notes(open(f"{SRC}/{slug}.html",errors="ignore").read())
    d.get(B+route); time.sleep(2.2)
    ours=[" ".join(e.text.split()) for e in d.find_elements(By.CSS_SELECTOR,".alert-orange")]
    m=[t for t in orig if t not in ours]
    miss+=len(m)
    if m: print(f"{route:34s} 누락 안내문 {len(m)}: {m[:2]}")
print("안내문 누락 합계",miss)
d.quit()
