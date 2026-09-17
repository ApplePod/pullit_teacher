"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "@/components/ProblemView";

/**
 * 원본 메타수학 시험지 렌더러 — 원본 인쇄 화면(printpaper)의 DOM 구조·클래스·속성을 그대로 재현.
 * #div2columnpapercontent.t_type11 > .page_template.page > .page_header/.page_header2 > .content > .first.column/.last.column > .divproblem …
 * 스타일은 원본 CSS(neq/bank/custom/exampaper/paper_template)가 담당. 수식은 KaTeX.
 */
declare global { interface Window { katex?: { renderToString(tex: string, opts?: object): string } } }
let katexP: Promise<void> | null = null;
function loadKatex() {
  if (typeof window === "undefined" || window.katex) return Promise.resolve();
  if (!katexP) katexP = new Promise<void>((res) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js"; s.onload = () => res(); s.onerror = () => res(); document.head.appendChild(s); });
  return katexP;
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function tex(s: string, _ready: boolean) {
  return s.replace(/(\$[^$]+\$)|([^$]+)/g, (_m, t, x) => t ? `<span class="edkeqation dontsplit" data-tex="${encodeURIComponent(t.slice(1, -1))}">${esc(t)}</span>` : esc(x ?? ""));
}

export type SheetMode = "problem" | "answer" | "solution";
export interface SheetMeta { title: string; studyName?: string; centerName?: string; paperId?: string; logoUrl?: string | null }

/** 문항 1개 → 원본 .divproblem 마크업 */
function problemHtml(p: Problem, no: number, ready: boolean, mode: SheetMode) {
  const paras = (p.question || []).map((b, i) => {
    const num = i === 0 ? `<span><span class="spnnumberingbox"><span class="spnresult" result=""></span><span class="numbering">${no}&nbsp;</span></span></span>` : "";
    return `<div class="edkparagraph dontsplit" align="justify" style="text-align:justify;margin-left:1.3333333333333333px;">${num}<span class="edkchar">${tex(b.text ?? "", ready)}</span></div>`;
  }).join("");
  const n = (p.choices || []).length;
  const choices = n ? `<ol class="divchoice dontsplit" count="${n}" array="0" autoarray="" valign="top">${(p.choices || []).map((c, i) => `<li num="${i + 1}"><span class="edkitempointbox"><span class="edkitempoint" group="1" num="${i + 1}"> </span></span><div class="edkparagraph" align="justify"><span class="edkchar">${tex(c, ready)}</span></div></li>`).join("")}</ol>` : "";
  const isShort = (p.answer_type ?? (p.choices?.length ? "multiple_choice" : "short_answer")) === "short_answer";
  const ans = p.answer_index
    ? ["①", "②", "③", "④", "⑤"][p.answer_index - 1] ?? String(p.answer_index)
    : (p.answer_value ?? p.answer_text ?? "");
  // 단답형: 보기가 없으므로 원본처럼 답 쓰는 자리를 둔다(문제지 모드에서만)
  const writeArea = isShort && mode === "problem"
    ? `<div class="divanswer" style="margin-top:8px;"><div class="edkparagraph"><span class="edkchar">답 <span style="display:inline-block;min-width:120px;border-bottom:1px solid #000;">&nbsp;</span></span></div></div>`
    : "";
  const TITLE: Record<string, string> = { insight: "핵심", solution: "풀이", diagnosis: "오답 진단" };
  const expl = mode === "solution" ? `<div class="divexplain"><div class="edkparagraph"><span class="edkchar"><b>정답 ${esc(ans)}</b></span></div>${(p.explanation || []).map((s) => `<div class="edkparagraph"><span class="edkchar"><b>[${TITLE[s.type ?? ""] ?? s.type ?? "해설"}]</b></span></div>${(s.blocks || []).map((b) => `<div class="edkparagraph"><span class="edkchar">${tex(b.text ?? "", ready)}</span></div>`).join("")}`).join("")}</div>` : "";
  const answerOnly = mode === "answer" ? `<div class="divanswer"><div class="edkparagraph"><span class="edkchar"><span class="numbering">${no}</span>&nbsp;${esc(ans)}</span></div></div>` : "";
  if (mode === "answer") return `<div class="divproblem dontsplit" ptype="50" headerid="N" numlen="1" style="height:auto;margin-bottom:12px;">${answerOnly}</div>`;
  return `<div class="divproblem dontsplit" ptype="50" headerid="N" numlen="1" area="MA" style="height:auto;margin-bottom:28px;"><div class="divtophtml"></div><div class="divheader"></div><div class="divheadhtml dontsplit"></div><div class="divquestion dontsplit"><div class="divasking">${paras}</div>${choices}${writeArea}</div>${expl}<div class="divtailhtml dontsplit"></div></div>`;
}

/** 대략적 높이 추정(px) — 2단·페이지 분배용 */
function estimate(p: Problem, mode: SheetMode) {
  if (mode === "answer") return 30;
  const chars = (p.question || []).reduce((a, b) => a + (b.text?.length ?? 0), 0);
  const lines = Math.ceil(chars / 38) + (p.question?.length ?? 1);
  const ch = (p.choices || []).reduce((a, c) => a + Math.max(1, Math.ceil(c.length / 34)), 0);
  const ex = mode === "solution" ? (p.explanation || []).reduce((a, s) => a + (s.blocks || []).reduce((x, b) => x + Math.ceil((b.text?.length ?? 0) / 38), 1), 0) : 0;
  const shortSpace = !(p.choices?.length) && mode === "problem" ? 2 : 0;   // 단답형 답란
  return 24 * (lines + ch + ex + shortSpace) + 40;
}

const SHEET_CSS = [
  "/legacy/css/edbank/font.css", "/legacy/css/edbank/neq.css", "/legacy/css/edbank/bank.css",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css",
  "/legacy/css/edbank/custom.css", "/legacy/css/edbank/exampaper.css", "/legacy/css/paper_template.css",
];
export function PaperSheet({ problems, meta, mode = "problem" }: { problems: Problem[]; meta: SheetMeta; mode?: SheetMode }) {
  const ready = false; // 수식은 iframe 내부 KaTeX 로 렌더
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameH, setFrameH] = useState(1300);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => { const h = e.data?.ptSheetHeight; if (typeof h === "number" && h > 200) setFrameH(h + 8); };
    window.addEventListener("message", onMsg); return () => window.removeEventListener("message", onMsg);
  }, []);

  // 페이지/컬럼 분배: 1페이지 컬럼 높이 950, 이후 1095 (원본 min-height 값)
  const pages = useMemo(() => {
    const out: { cols: [Problem[], Problem[]]; }[] = [];
    let cur: [Problem[], Problem[]] = [[], []], col = 0, used = 0, limit = 950;
    for (const p of problems) {
      const h = estimate(p, mode);
      if (used + h > limit && (cur[col].length > 0)) {
        if (col === 0) { col = 1; used = 0; }
        else { out.push({ cols: cur }); cur = [[], []]; col = 0; used = 0; limit = 1095; }
      }
      cur[col].push(p); used += h;
    }
    if (cur[0].length || cur[1].length) out.push({ cols: cur });
    return out;
  }, [problems, mode]);

  let no = 0;
  const html = pages.map((pg, pi) => {
    const colHtml = (list: Problem[]) => list.map((p) => { no += 1; return problemHtml(p, no, ready, mode); }).join("");
    const minH = pi === 0 ? 950 : 1095;
    const header = pi === 0
      ? `<div class="page_header" style="position:relative;"><div class="paper_header t_type11 c_type1" style="display:block;" kind="P"><img src="/Assets2/images/paper_template/c_type1/t_type11.png" alt="*" class="bg_img"><div class="logo">${meta.logoUrl ? `<img src="${meta.logoUrl}" alt="*">` : ""}</div><div class="exam_tag"><span class="hash">#</span><span>${esc(meta.studyName ?? "교과학습")}</span></div><div class="exam_tit"><span>${esc(meta.title)}</span></div><div class="exam_num"><span class="hash">#</span><span kind="problem_cnt">${problems.length}</span><strong>문항</strong></div><div class="s_info"><p class="date"><strong>날짜<span>:</span></strong></p><p class="name1"><strong>학년/이름<span>:</span></strong></p><p class="name2"><strong></strong></p><p class="name3"><span></span></p><p class="name4"><span></span></p></div><div class="score"><strong>점수<span>:</span></strong></div><div class="qr_code"></div></div></div>`
      : `<div class="page_header2" style="position:relative;"><span style="position:absolute;left:10px;top:10px"><b>${esc(meta.title)}</b></span></div>`;
    const barTop = pi === 0 ? 100 : 40;
    return `<div class="page_template page" id="divpaper_${pi + 1}" style="display:block;">${header}<div class="content" numberingtype="left" maxnumberlen="1" fontkind="g" align="left" letterspacing="narrow1" ${mode === "problem" ? 'onlyproblem="Y"' : mode === "answer" ? 'onlysolution="Y"' : 'problemsolution="Y"'}><div class="first column" style="width:50%;float:left;height:auto;min-height:${minH}px;">${colHtml(pg.cols[0])}</div><div class="last  column" style="width:50%;float:left;height:auto;min-height:${minH}px;">${colHtml(pg.cols[1])}</div><br style="clear:both;"></div><div class="barcolumn" style="position:absolute;left:50%;width:1px;top:${barTop}px;bottom:40px;border-left:1px dotted #000;"></div><div class="page_footer"><span class="spnpaging"><span class="spnpagenumber">${pi + 1}</span> / <span class="spnpagecount">${pages.length}</span></span><span class="spnbottomtitle">문제지ID: ${esc(meta.paperId ?? "")}</span></div></div>`;
  }).join("");

  // 원본과 동일하게 시험지를 독립 문서(iframe)로 렌더 — 포털 CSS(Pretendard 등) 간섭 차단
  const srcdoc = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
${SHEET_CSS.map((h) => `<link rel="stylesheet" href="${h}">`).join("")}
<style>body{margin:0;background:#fff}#div2columnpaper{padding:12px 0}.page_template{margin:0 auto 24px;box-shadow:0 2px 10px rgba(0,0,0,.12)}@media print{.page_template{box-shadow:none;margin:0;page-break-after:always}}</style>
</head><body><div id="div2columnpaper"><div id="div2columnpapercontent" class="t_type11" prntwoside="N">${html}</div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js"></script>
<script>
(function(){function run(){if(!window.katex)return;document.querySelectorAll('span.edkeqation[data-tex]').forEach(function(e){try{e.innerHTML=window.katex.renderToString(decodeURIComponent(e.getAttribute('data-tex')),{throwOnError:false});}catch(x){}});}
if(window.katex)run();else{var s=document.querySelector('script[src*="katex.min.js"]');s&&s.addEventListener('load',run);}
function fit(){try{parent.postMessage({ptSheetHeight:document.documentElement.scrollHeight},'*');}catch(e){}}
window.addEventListener('load',fit);setTimeout(fit,600);setTimeout(fit,1500);})();
</script></body></html>`;
  return (
    <div className="pt-sheet-host">
      <iframe ref={frameRef} title="시험지" srcDoc={srcdoc} style={{ width: 900, maxWidth: "100%", height: frameH, border: "none", background: "#fff", display: "block", margin: "0 auto" }} />
    </div>
  );
}
