import json, glob, os, re
SRC="/Users/harry/Desktop/Claude_newlearn/mmath_복원_동적"
APP="/Users/harry/Desktop/Claude_newlearn/pullit_teacher/src/app/(portal)"
# 이미 기능 구현된 라우트는 건너뜀
SKIP_ROUTES={"/paper/make","/management/student"}  # 기능 구현분 보존
def path_to_route(p):
    m=re.search(r'/Pages/Center/(.+?)\.cshtml', p, re.I)
    if not m:
        return "/dashboard" if p.rstrip('/').lower().endswith('/center') else None
    return "/"+m.group(1).lower()

def clean(html):
    m=re.search(r'<article id="contents"[^>]*>(.*)</article>', html, re.S)
    inner = m.group(1) if m else html
    # 페이지 자체의 per-page contents-header 제거 (상단 GNB 가 대체) — div 균형 매칭
    m=re.search(r'<div class="contents-header"[^>]*>', inner)
    if m:
        st=m.start(); i=m.end(); depth=1
        for tm in re.finditer(r'<(/?)div\b', inner[i:], re.I):
            depth += -1 if tm.group(1) else 1
            if depth==0:
                end=i+inner[i:].find('>',tm.end())+1; inner=inner[:st]+inner[end:]; break
    inner=re.sub(r'<script.*?</script>','',inner,flags=re.S)
    inner=re.sub(r'<!--.*?-->','',inner,flags=re.S)
    inner=re.sub(r'\{\{.*?\}\}','',inner,flags=re.S)
    for a in ['data-v-app','data-bs-[a-z-]+','aria-[a-z]+','on[a-z]+','v-[a-z:.-]+',':[a-z-]+','@[a-z.]+','role','tabindex']:
        inner=re.sub(rf'\s{a}="[^"]*"','',inner)
    inner=re.sub(r'\stype="[Bb]utton"','',inner)
    # 내부 링크를 우리 라우트로
    inner=re.sub(r'/[Pp]ages/[Cc]enter/([A-Za-z0-9_/]+?)\.cshtml', lambda mm:"/"+mm.group(1).lower(), inner)
    inner=re.sub(r'href="(?!/|#)[^"]*"','href="#"',inner)
    # div 균형
    op=len(re.findall(r'<div\b',inner)); cl=len(re.findall(r'</div>',inner))
    inner+='</div>'*max(0,op-cl)
    inner=re.sub(r'>\s+<','><',inner)
    return inner.strip()

count=0; skipped=0
idx=json.load(open(f"{SRC}/_index.json"))
for rec in idx:
    if rec.get("error"): continue
    p=rec["path"]; route=path_to_route(p)
    if not route or route in SKIP_ROUTES: skipped+=1; continue
    if any(x in p for x in ("/Login/","/Popup/","/shared/","Dashboard/")): skipped+=1; continue
    html=open(f"{SRC}/{rec['slug']}.html").read()
    inner=clean(html)
    d=f"{APP}{route}"; os.makedirs(d, exist_ok=True)
    esc=inner.replace("\\","\\\\").replace("`","\\`").replace("${","\\${")
    page=('const HTML = `%s`;\n\nexport default function Page() {\n  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;\n}\n' % esc)
    open(f"{d}/page.tsx","w").write(page)
    count+=1
print(f"생성 {count} · 건너뜀 {skipped}")
