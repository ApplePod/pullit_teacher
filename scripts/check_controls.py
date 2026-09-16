# 모든 화면의 입력 컨트롤을 실제로 조작해 반응하는지 전수 점검
# 체크박스: 눌러 선택 → 다시 눌러 해제 / 라디오: 각 항목 선택 / 슬라이더: 값 변경 반영
# 셀렉트: 옵션 변경 / 아코디언: 열고 닫기
import os, sys, time, json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

B = f"http://localhost:{os.environ.get('OURS_PORT','3777')}"
ROUTES = sys.argv[1:] or [
    "/dashboard", "/paper/mypaper", "/paper/favorite", "/paper/favoritequestion", "/paper/share", "/paper/trash",
    "/clinic/studentmark", "/clinic/class", "/clinic/report", "/clinic/trash",
    "/management/student", "/management/studentform", "/management/class", "/management/teacher",
    "/management/attendance", "/management/book", "/management/statistic", "/management/individualstdbooks",
    "/management/centerinfo", "/mypage/profile",
]

SWEEP = r"""
const out = {checkbox: [], radio: [], range: [], select: [], accordion: []};
const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
  return (r.width > 0 && r.height > 0) || s.opacity === '0' || s.position === 'absolute'; };
const label = (e) => {
  const l = e.id ? document.querySelector(`label[for="${CSS.escape(e.id)}"]`) : null;
  return ((l && l.innerText) || e.getAttribute('aria-label') || e.name || e.id || '').replace(/\s+/g,' ').trim().slice(0, 24);
};
const clickable = (e) => (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) || e;

// 체크박스: 선택 → 해제
document.querySelectorAll('input[type=checkbox]').forEach((c) => {
  if (c.disabled) return;
  const before = c.checked;
  clickable(c).click();
  const on = c.checked;
  clickable(c).click();
  const off = c.checked;
  const ok = (on !== before) && (off === before);
  out.checkbox.push([label(c), ok, `${before}→${on}→${off}`]);
  if (c.checked !== before) { c.checked = before; }
});
// 라디오: 그룹별로 각 항목 선택
const groups = {};
document.querySelectorAll('input[type=radio]').forEach((r) => { if (r.disabled) return; (groups[r.name || ('_' + (r.id||'').slice(0,6))] ||= []).push(r); });
Object.entries(groups).forEach(([g, list]) => {
  list.forEach((r) => {
    clickable(r).click();
    out.radio.push([g + ':' + label(r), r.checked, String(r.checked)]);
  });
});
// 슬라이더: 값 변경이 반영되는지
document.querySelectorAll('input[type=range]').forEach((r) => {
  if (r.disabled) return;
  const before = r.value, styleBefore = r.getAttribute('style') || '';
  const parentText = () => (r.closest('.range-slider, .accordion-body, li, div')?.innerText || '').replace(/\s+/g,' ').trim().slice(0,60);
  const textBefore = parentText();
  const target = String(Math.min(Number(r.max || 100), Number(before) + Number(r.step || 1) * 3));
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(r, target);
  r.dispatchEvent(new Event('input', { bubbles: true }));
  r.dispatchEvent(new Event('change', { bubbles: true }));
  const styleAfter = r.getAttribute('style') || '';
  out.range.push([label(r), r.value === target, `${before}→${r.value}`, styleBefore !== styleAfter || textBefore !== parentText()]);
});
// 셀렉트: 다른 옵션 선택
document.querySelectorAll('select').forEach((s) => {
  if (s.disabled || s.options.length < 2) return;
  const before = s.value;
  const other = [...s.options].find((o) => o.value !== before && !o.disabled);
  if (!other) return;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(s, other.value);
  s.dispatchEvent(new Event('change', { bubbles: true }));
  out.select.push([label(s) || (s.className||'').slice(0,20), s.value === other.value, `${before}→${s.value}`]);
});
// 아코디언: 열고 닫기
document.querySelectorAll('.accordion-button').forEach((b) => {
  const body = b.closest('.accordion-item')?.querySelector('.accordion-collapse');
  if (!body) return;
  const before = body.className;
  b.click();
  const mid = body.className;
  b.click();
  out.accordion.push([(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20), before !== mid, `${before.includes('show')}→${mid.includes('show')}`]);
});
return out;
"""

o = Options(); o.add_argument("--headless=new"); o.add_argument("--window-size=1440,1100")
d = webdriver.Chrome(options=o); d.set_page_load_timeout(120)
d.get(B + "/login"); time.sleep(2.5)
d.find_element(By.CSS_SELECTOR, "input[type=text]").send_keys("admin")
d.find_element(By.CSS_SELECTOR, "input[type=password]").send_keys("admin1")
d.find_element(By.CSS_SELECTOR, "button[type=submit]").click(); time.sleep(4)

total = 0; bad = 0
for r in ROUTES:
    d.get(B + r); time.sleep(3)
    try:
        res = d.execute_script(SWEEP)
    except Exception as e:
        print(f"\n## {r}  실행 오류: {str(e)[:120]}"); continue
    fails = []
    for kind in ("checkbox", "radio", "select", "accordion"):
        for item in res[kind]:
            total += 1
            if not item[1]: fails.append(f"{kind}:{item[0]}({item[2]})")
    for item in res["range"]:
        total += 1
        if not item[1]: fails.append(f"range:{item[0]}({item[2]}) 값반영X")
        elif not item[3]: fails.append(f"range:{item[0]}({item[2]}) 화면반영X")
    bad += len(fails)
    counts = {k: len(v) for k, v in res.items() if v}
    print(f"\n## {r}  {counts}")
    for f in fails[:14]: print(f"   FAIL {f}")
    errs = [e["message"][:100] for e in d.get_log("browser") if e["level"] == "SEVERE" and "Failed to load resource" not in e["message"]]
    if errs: print(f"   JS 오류 {len(errs)}: {errs[0]}"); bad += len(errs)
print(f"\n총 컨트롤 {total}개 · 실패 {bad}개")
d.quit()
