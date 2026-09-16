import os
# 원본 버튼 계산 스타일 vs 우리 화면 (배경/글자/테두리/둥글기/패딩/글자크기/굵기/높이)
import json,time,os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
ACT="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적/actions"
ROUTES={"/clinic/studentmark":"pages_center_clinic_studentmark_cshtml","/clinic/class":"pages_center_clinic_class_cshtml","/clinic/report":"pages_center_clinic_report_cshtml","/clinic/trash":"pages_center_clinic_trash_cshtml",
"/management/teacher":"pages_center_management_teacher_cshtml","/management/class":"pages_center_management_class_cshtml","/management/attendance":"pages_center_management_attendance_cshtml","/management/book":"pages_center_management_book_cshtml",
"/management/statistic":"pages_center_management_statistic_cshtml","/management/individualstdbooks":"pages_center_management_individualstdbooks_cshtml","/management/centerinfo":"pages_center_management_centerinfo_cshtml",
"/management/student":"pages_center_management_student_cshtml","/management/studentform":"pages_center_management_studentform_cshtml",
"/paper/mypaper":"pages_center_paper_mypaper_cshtml","/paper/favorite":"pages_center_paper_favorite_cshtml","/paper/share":"pages_center_paper_share_cshtml","/paper/trash":"pages_center_paper_trash_cshtml","/paper/favoritequestion":"pages_center_paper_favoritequestion_cshtml","/dashboard":"pages_center"}
KEYS=["backgroundColor","color","border","borderRadius","padding","fontSize","fontWeight","height"]
JS="""
const out={};
document.querySelectorAll('button, a.btn, a.button__line, label').forEach(e=>{
  const t=(e.innerText||'').replace(/\\s+/g,' ').trim(); if(!t) return;
  const r=e.getBoundingClientRect(); if(r.width<1||r.height<1) return;
  const s=getComputedStyle(e);
  const k=t+'|'+e.tagName.toLowerCase()+'|'+(e.className||'').trim();
  (out[k]=out[k]||[]).push({backgroundColor:s.backgroundColor,color:s.color,border:s.border,borderRadius:s.borderRadius,padding:s.padding,fontSize:s.fontSize,fontWeight:s.fontWeight,height:s.height});
});
return out;"""
o=Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1000")
d=webdriver.Chrome(options=o); d.set_page_load_timeout(60); B=f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
d.get(B+"/login"); time.sleep(1.5)
d.find_element(By.CSS_SELECTOR,"input[type=text]").send_keys("admin"); d.find_element(By.CSS_SELECTOR,"input[type=password]").send_keys("admin1"); d.find_element(By.CSS_SELECTOR,"button[type=submit]").click(); time.sleep(3)
tot=cmp=0; diffs={}
for route,slug in ROUTES.items():
    f=f"{ACT}/{slug}/actions.json"
    if not os.path.exists(f): continue
    orig=json.load(open(f))
    d.get(B+route); time.sleep(2.5)
    ours=d.execute_script(JS)
    for b in orig:
        t=" ".join((b.get("text") or "").split())
        key=f"{t}|{b.get('tag','')}|{(b.get('cls') or '').strip()}"
        if key not in ours: continue
        ourstyle=ours[key]
        st=b.get("style") or {}
        cmp+=1
        best=None
        for cand in ourstyle:
            bad=[]
            for k in KEYS:
                ov=st.get(k); uv=cand.get(k)
                if ov is None or uv is None: continue
                if k=="height" and ov.endswith("px") and uv.endswith("px"):
                    if abs(float(ov[:-2])-float(uv[:-2]))<=2: continue
                if ov!=uv: bad.append(f"{k}: 원본 {ov} / 우리 {uv}")
            if best is None or len(bad)<len(best): best=bad
            if not bad: break
        bad=best or []
        if bad:
            tot+=1; diffs.setdefault(route,[]).append((t,bad))
for r,v in diffs.items():
    print(f"\n## {r} — 스타일 불일치 {len(v)}")
    for t,bad in v[:6]: print(f"  [{t}] " + " | ".join(bad[:3]))
print(f"\n비교 {cmp}개 중 불일치 {tot}개")
d.quit()
