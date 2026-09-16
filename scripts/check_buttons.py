# 기능화된 전 화면: 원본 버튼(텍스트+클래스) 대조 + 미선택 클릭 알림 + JS 오류 수집
import time,json,sys,os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
ACT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적/actions"
ROUTES={"/clinic/studentmark":"pages_center_clinic_studentmark_cshtml","/clinic/class":"pages_center_clinic_class_cshtml","/clinic/report":"pages_center_clinic_report_cshtml","/clinic/trash":"pages_center_clinic_trash_cshtml",
"/management/teacher":"pages_center_management_teacher_cshtml","/management/class":"pages_center_management_class_cshtml","/management/attendance":"pages_center_management_attendance_cshtml","/management/book":"pages_center_management_book_cshtml",
"/management/statistic":"pages_center_management_statistic_cshtml","/management/individualstdbooks":"pages_center_management_individualstdbooks_cshtml","/management/centerinfo":"pages_center_management_centerinfo_cshtml","/mypage/profile":"pages_center_mypage_profile_cshtml",
"/management/student":"pages_center_management_student_cshtml","/management/studentform":"pages_center_management_studentform_cshtml","/paper/mypaper":"pages_center_paper_mypaper_cshtml","/paper/favorite":"pages_center_paper_favorite_cshtml","/paper/share":"pages_center_paper_share_cshtml","/paper/trash":"pages_center_paper_trash_cshtml"}
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1400,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60); B="http://localhost:3777"
d.get(B+"/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
def norm(t): return " ".join(t.split())
tot_missing=0
for route,slug in ROUTES.items():
    d.get(B+route); time.sleep(3)
    ours={(norm(b.text),norm(b.get_attribute("class") or "")) for b in d.find_elements(By.CSS_SELECTOR,"button, a.btn, a.button__line, label, .category-btns-item, .nav-link") if norm(b.text)}
    try: orig=json.load(open(f"{ACT}/{slug}/actions.json"))
    except Exception: orig=[]
    ob=[(norm(x.get("text","")),norm(x.get("class","") or "")) for x in (orig if isinstance(orig,list) else orig.get("buttons",[])) if norm(x.get("text",""))]
    ob=[x for x in ob if x[0] not in ("Scroll to Top",) and x[0] not in ("1","")]
    ours_txt={t for t,_ in ours}
    missing=[x for x in ob if x[0] not in ours_txt]
    tot_missing+=len(missing)
    errs=[e["message"][:120] for e in d.get_log("browser") if e["level"]=="SEVERE" and "Failed to load resource" not in e["message"]]
    print(f"{route:36s} ours={len(ours):3d} orig={len(ob):3d} missing={len(missing)} js_err={len(errs)}")
    for m in missing[:12]: print("     - 누락:",m)
    for e in errs[:3]: print("     ! ",e)
    # 미선택 클릭 알림
    for b in d.find_elements(By.CSS_SELECTOR,".category-btns .category-btns-item")[:9]:
        t=norm(b.text)
        try:
            b.click(); time.sleep(0.6)
            p=d.find_elements(By.CSS_SELECTOR,".modal.show .modal-body p, .modal.show .modal-body")
            msg=norm(p[0].text)[:40] if p else ""
            # 닫기
            for c in d.find_elements(By.CSS_SELECTOR,".modal.show .modal-footer button.cancel, .modal.show .modal-footer button.submit, .modal.show .btn-close"):
                try: c.click(); time.sleep(0.2); break
                except Exception: pass
            lay=d.find_elements(By.CSS_SELECTOR,"div[kind=iframe_layer]")
            if lay: d.execute_script("window.postMessage({ptClosePopup:true},'*')"); time.sleep(0.4)
            print(f"     · [{t}] → {'레이어' if lay else ('모달:'+msg if msg else '반응없음')}")
        except Exception as ex: print(f"     · [{t}] click_error {str(ex)[:60]}")
print("TOTAL missing", tot_missing)
d.quit()
