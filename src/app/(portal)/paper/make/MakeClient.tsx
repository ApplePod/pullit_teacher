"use client";

import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchProblems, createPaper } from "../actions";
import { ProblemView, type Problem } from "@/components/ProblemView";
import { PaperSheet } from "@/components/PaperSheet";
import { STEP1_AUTO, STEP1_DIRECT, STEP1_BOOK, STEP2_TYPES, STEP3_PRINT } from "./steps/wizardHtml";
import { closeLayerPopup, openLayerPopupFromChild } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { BTN_CANCEL } from "@/components/portal/OriginalModal";

interface Unit { code: string; subject: string; large_name: string; middle_name: string; ord: number }
type Method = "A" | "D" | "B";
const STEP1: Record<Method, string> = { A: STEP1_AUTO, D: STEP1_DIRECT, B: STEP1_BOOK };
const STEPS = ["기본 설정", "문제지 편집", "프린트 설정", "만들기 완료"];

/** 프린트 설정(원본 #tplPrintOption 패널 값) — paper.options JSONB 에 그대로 저장 */
type PrintOptions = {
  kinds: string[];      // 유형: P 문제지 / A 정답 / S 해설 / T 선생님용
  columns: string;      // 단: 2 | 3(2단 조판)
  layout: string;       // 문제 배치: 0 자동 / 1~3 1단 N문항
  fontkind: string;     // g 고딕 / m 명조 / m3 바탕 / g2 산스
  fontsize: string;     // 0 기본 / 1 작게 / 2 더작게
  textalign: string;    // left / justify
  show_info: string;    // "true" 노출 / "false" 비노출
  blank_page: boolean; paper_id: boolean;
  color: string;        // 상단 디자인 색상 01~07
  template: string;     // t_type11 …
  hdr_default: boolean; hdr_title: boolean; hdr_title_text: string; hdr_study: boolean; hdr_study_text: string; hdr_grade_name: boolean; hdr_qr: boolean;
  favorite_name: string;
};
const DEFAULT_OPTIONS: PrintOptions = {
  kinds: ["P", "A", "S"], columns: "2", layout: "0", fontkind: "g", fontsize: "0", textalign: "left", show_info: "true",
  blank_page: false, paper_id: true, color: "01", template: "t_type11",
  hdr_default: true, hdr_title: true, hdr_title_text: "", hdr_study: false, hdr_study_text: "", hdr_grade_name: true, hdr_qr: false, favorite_name: "",
};
/** 원본 패널의 id 없는 체크박스(.filter-label label > p 텍스트) ↔ 옵션 키 */
const LABEL_KEYS: Record<string, keyof PrintOptions> = {
  "빈 페이지 삽입": "blank_page", "문제지 ID": "paper_id", "템플릿 기본 표기 내용": "hdr_default", "문제지명": "hdr_title",
  "학습구분": "hdr_study", "학년/이름": "hdr_grade_name", "QR코드": "hdr_qr",
};
const RADIO_KEYS: [string, keyof PrintOptions][] = [
  ["p3_radio1-", "columns"], ["p3_radio2-", "layout"], ["opt_fontkind_", "fontkind"], ["opt_fontsize_", "fontsize"], ["opt_textalign_", "textalign"], ["p3_radio5-", "show_info"],
];
const autoName = () => `${new Date().toLocaleDateString("ko-KR")} 문제지`;

/** 원본 문제지 만들기(makestudy) — 원본 마크업 그대로 렌더 + 직접출제 경로 동작 */
export function MakeClient({ units, popup = false }: { units: Unit[]; popup?: boolean }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("A");
  const [step, setStep] = useState(0);
  const [paperName, setPaperName] = useState("");
  const host = useRef<HTMLDivElement>(null);

  // 직접출제(D) 동작 상태
  const [subject, setSubject] = useState<"math" | "english">("math");
  const [unitCode, setUnitCode] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: Problem[]; total: number }>({ items: [], total: 0 });
  const [selected, setSelected] = useState<Problem[]>([]);
  const [options, setOptions] = useState<PrintOptions>(DEFAULT_OPTIONS);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const [pending, start] = useTransition();

  // 원본 마크업 안의 출제방식 라디오·아코디언·프린트 설정 탭을 React 상태와 연결
  useEffect(() => {
    const root = host.current; if (!root) return;
    const map: Record<string, Method> = { "radio111-01": "A", "radio111-02": "D", "radio111-03": "B" };
    Object.entries(map).forEach(([id, m]) => { const el = root.querySelector<HTMLInputElement>("#" + id); if (el) el.checked = m === method; });
    const onClick = (e: Event) => {
      const t = e.target as HTMLElement;
      const label = t.closest("label[for]") as HTMLLabelElement | null;
      const id = label?.htmlFor || (t as HTMLInputElement).id;
      if (id && map[id]) { e.preventDefault(); setMethod(map[id]); return; }
      // 원본의 아코디언 토글
      const btn = t.closest(".accordion-button");
      if (btn) { const body = btn.closest(".accordion-item")?.querySelector(".accordion-collapse"); body?.classList.toggle("show"); return; }
      // 프린트 설정 패널: bootstrap 탭(data-bs-toggle="tab")
      const tab = t.closest<HTMLElement>(".nav-link[data-bs-target]");
      if (tab) {
        e.preventDefault();
        tab.closest("ul")?.querySelectorAll(".nav-link").forEach((n) => { n.classList.remove("active"); n.setAttribute("aria-selected", "false"); });
        tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
        const pane = root.querySelector<HTMLElement>(tab.dataset.bsTarget || "");
        pane?.parentElement?.querySelectorAll(":scope > .tab-pane").forEach((p) => p.classList.remove("active", "show"));
        pane?.classList.add("active", "show");
        return;
      }
      // 우측 탭 접기/펼치기(원본 .expanded 버튼 / 접힌 상태의 아이콘)
      if (t.closest(".right-tab .expanded") || t.closest(".right-tab .collapsed-item")) { t.closest(".right-tab")?.classList.toggle("collapsed"); return; }
      // 상단 디자인(템플릿) 슬라이드 선택
      const slide = t.closest<HTMLElement>(".swiper-slide");
      if (slide) { const m = /\/(t_type\d+)\.png/.exec(slide.querySelector("img")?.getAttribute("src") || ""); if (m) setOptions((o) => ({ ...o, template: m[1] })); }
    };
    const onChange = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (!el || !el.closest("#tplStep3Right")) return;
      const id = el.id || "";
      setOptions((o) => {
        if (id.startsWith("p3_type")) return { ...o, kinds: el.checked ? [...o.kinds.filter((k) => k !== el.value), el.value] : o.kinds.filter((k) => k !== el.value) };
        const r = RADIO_KEYS.find(([p]) => id.startsWith(p)); if (r) return { ...o, [r[1]]: el.value };
        if (id === "f_new_pfavorite_name") return { ...o, favorite_name: el.value };
        if (el.closest(".palette-list")) return { ...o, color: el.value };
        const label = el.closest<HTMLLabelElement>(".filter-label label");
        if (label) {
          const txt = label.querySelector("p")?.textContent?.trim() ?? "";
          if (el.type === "checkbox" && LABEL_KEYS[txt]) return { ...o, [LABEL_KEYS[txt]]: el.checked };
          if (el.type === "text") return { ...o, [txt === "문제지명" ? "hdr_title_text" : "hdr_study_text"]: el.value };
        }
        return o;
      });
    };
    root.addEventListener("click", onClick); root.addEventListener("change", onChange); root.addEventListener("input", onChange);
    return () => { root.removeEventListener("click", onClick); root.removeEventListener("change", onChange); root.removeEventListener("input", onChange); };
  }, [method, step]);

  // 프린트 설정 패널(verbatim 마크업)에 옵션 상태 반영 — 원본 라디오에 name 이 없어 직접 checked 동기화
  useEffect(() => {
    const panel = host.current?.querySelector<HTMLElement>("#tplStep3Right"); if (!panel) return;
    const o = options;
    panel.querySelectorAll<HTMLInputElement>('input[id^="p3_type"]').forEach((el) => { el.checked = o.kinds.includes(el.value); });
    RADIO_KEYS.forEach(([p, k]) => panel.querySelectorAll<HTMLInputElement>(`input[id^="${p}"]`).forEach((el) => { el.checked = el.value === String(o[k]); }));
    panel.querySelectorAll<HTMLInputElement>(".palette-list input").forEach((el) => { el.checked = el.value === o.color; });
    panel.querySelectorAll<HTMLElement>(".swiper-slide").forEach((el) => { el.classList.toggle("active", (el.querySelector("img")?.getAttribute("src") || "").includes(`/${o.template}.png`)); });
    panel.querySelectorAll<HTMLLabelElement>(".filter-label label").forEach((l) => {
      const txt = l.querySelector("p")?.textContent?.trim() ?? "";
      const cb = l.querySelector<HTMLInputElement>('input[type="checkbox"]'); const k = LABEL_KEYS[txt];
      if (cb && k) cb.checked = !!o[k];
      const ti = l.querySelector<HTMLInputElement>('input[type="text"]');
      if (ti) { const v = txt === "문제지명" ? o.hdr_title_text : o.hdr_study_text; if (ti.value !== v) ti.value = v; }
    });
    const fav = panel.querySelector<HTMLInputElement>("#f_new_pfavorite_name"); if (fav && fav.value !== o.favorite_name) fav.value = o.favorite_name;
  }, [options, step]);

  const subjectUnits = units.filter((u) => u.subject === subject);
  const doSearch = (p = 1) => { setPage(p); start(async () => setResult(await searchProblems({ subject, unit_code: unitCode || undefined, difficulty: difficulty || undefined, page: p }))); };
  const toggle = (pb: Problem) => setSelected((c) => c.some((x) => x.problem_code === pb.problem_code) ? c.filter((x) => x.problem_code !== pb.problem_code) : [...c, pb]);
  const isSel = (code: string) => selected.some((x) => x.problem_code === code);
  const paperInput = (status: "draft" | "ready") => ({ name: paperName || autoName(), subject, problem_codes: selected.map((s) => s.problem_code), options: { ...options, method }, status });

  /** 프린트 설정 → 다음: 저장 후 '만들기 완료' 단계 표시 */
  const finish = () => start(async () => {
    const r = await createPaper(paperInput("ready"));
    if (r.error || !r.id) { await metaAlert(r.error || "문제지 생성에 실패했습니다."); return; }
    setCreated({ id: r.id, name: paperName || autoName() }); setStep(3);
  });
  const next = () => {
    if (step === 1 && method === "D" && selected.length === 0) { void metaAlert("문항을 1개 이상 선택해주세요."); return; }
    if (step === 2) finish(); else if (step < 2) setStep(step + 1);
  };
  const prev = () => { if (step > 0 && step < 3) setStep(step - 1); };
  /** 원본 doSaveTemp — 임시 저장(draft) */
  const saveTemp = () => start(async () => {
    const r = await createPaper(paperInput("draft"));
    await metaAlert(r.error || "임시 저장되었습니다.");
  });
  /** 원본 doInitDefault — 처음부터 다시하기 */
  const resetAll = async () => {
    if (!(await metaConfirm("처음부터 다시 하시겠습니까?\n입력한 내용이 모두 초기화됩니다."))) return;
    setMethod("A"); setStep(0); setPaperName(""); setSubject("math"); setUnitCode(""); setDifficulty(""); setPage(1);
    setResult({ items: [], total: 0 }); setSelected([]); setOptions(DEFAULT_OPTIONS); setCreated(null);
  };
  const close = () => (popup ? closeLayerPopup() : router.push("/paper/mypaper"));
  /** 만들기 완료 단계 버튼 — 부모창 레이어 팝업으로 열기(원본 $m.openLayerPopup) */
  const openLayer = (url: string) => (popup ? openLayerPopupFromChild(url) : router.push(url));
  const goList = () => { if (popup) window.parent.postMessage({ ptClosePopup: true, ptGoto: "/paper/mypaper" }, "*"); else router.push("/paper/mypaper"); };
  const totalPages = Math.ceil(result.total / 20);

  return (
    <div className="makestudy-wrap" ref={host}>
      {/* 원본 상단 바(mark-header__top): 닫기 / 문제지명 / 처음부터 다시하기·임시 저장 */}
      <div className="mark-header">
        <ul className="mark-header__top input-title">
          <li><button type="button" onClick={close}><i className="fa-sharp fa-regular fa-angle-left"></i> 닫기</button></li>
          <li className="title-area"><span>문제지명</span>
            <input type="text" className="form-control" maxLength={50} style={{ width: "50%", minWidth: 500 }} placeholder={autoName()} value={paperName} onChange={(e) => setPaperName(e.target.value)} /></li>
          <li>
            <button type="button" onClick={resetAll}><span className="material-symbols-sharp">restart_alt</span> 처음부터 다시하기</button>
            <button type="button" onClick={saveTemp} disabled={pending || step === 3}><span className="material-symbols-sharp">cloud_upload</span> 임시 저장</button>
          </li>
        </ul>
      </div>
      {/* 원본 스텝퍼(preview-header): 이전 / 기본 설정 - 문제지 편집 - 프린트 설정 - 만들기 완료 / 다음 */}
      <div className="preview-header include-right include-left">
        <div className="m-auto d-flex gap-4">
          <button type="button" className="button__fill button__line--xsmall button__line--white button__weight--medium bw6" disabled={step === 0 || step === 3} onClick={prev}><i className="fa-sharp fa-regular fa-angle-left"></i> 이전</button>
          <div className="stepper">
            {STEPS.map((s, i) => (
              <Fragment key={s}>
                <a href="" className={i === step ? "current" : step === 3 || i > step + 1 ? "pointer-events-none" : ""}
                  onClick={(e) => { e.preventDefault(); if (step === 3) return; if (i < step) setStep(i); else if (i === step + 1) next(); }}>{s}</a>
                {i < STEPS.length - 1 && <div className="dash"></div>}
              </Fragment>
            ))}
          </div>
          <button type="button" className="button__line button__line--xsmall button__fill--red" onClick={next} disabled={pending || step === 3}>다음 <i className="fa-sharp fa-regular fa-angle-right"></i></button>
        </div>
      </div>

      {/* STEP 0: 기본 설정 — 원본 마크업(출제방식별 캡처) */}
      {step === 0 && <div id="contents" className="include-all" dangerouslySetInnerHTML={{ __html: STEP1[method] }} />}

      {/* STEP 1: 문제지 편집 */}
      {step === 1 && method !== "D" && <div id="contents" className="include-all pb-24" dangerouslySetInnerHTML={{ __html: STEP2_TYPES }} />}
      {step === 1 && method === "D" && (
        <div id="contents" className="include-all pb-24">
          <div className="accordion accordion-basic mb-16">
            <article className="accordion-item mb-8">
              <h2 className="accordion-header"><div className="accordion-button">문항 조회</div></h2>
              <div className="accordion-body">
                <div className="filter-radio mb-12">
                  <input type="radio" name="dsubj" id="ds-math" checked={subject === "math"} onChange={() => { setSubject("math"); setUnitCode(""); }} /><label htmlFor="ds-math">수학</label>
                  <input type="radio" name="dsubj" id="ds-eng" checked={subject === "english"} onChange={() => { setSubject("english"); setUnitCode(""); }} /><label htmlFor="ds-eng">영어</label>
                </div>
                <div className="d-flex gap-2 align-items-center mb-12">
                  <div className="select__small"><select value={unitCode} onChange={(e) => setUnitCode(e.target.value)}>
                    <option value="">전체 단원</option>{subjectUnits.map((u) => <option key={u.code} value={u.code}>{u.large_name} · {u.middle_name}</option>)}
                  </select></div>
                  {subject === "math" && (
                    <div className="filter-radio">
                      {([["", "전체"], ["basic", "하"], ["normal", "중"], ["advanced", "상"]] as const).map(([v, l]) => (<span key={v}><input type="radio" name="ddiff" id={`dd-${v}`} checked={difficulty === v} onChange={() => setDifficulty(v)} /><label htmlFor={`dd-${v}`}>{l}</label></span>))}
                    </div>
                  )}
                  <button type="button" className="button__line button__line--xsmall button__fill--red" onClick={() => doSearch(1)} disabled={pending}>검색</button>
                  <span className="f-12 bw5">검색 결과 <b>{result.total.toLocaleString()}</b>건 · 선택 <b>{selected.length}</b></span>
                </div>
              </div>
            </article>
            <article className="accordion-item">
              <h2 className="accordion-header"><div className="accordion-button">문항 선택</div></h2>
              <div className="accordion-body">
                <div className="marsonry-question-list item-1">
                  {result.items.map((pb) => (
                    <div key={pb.problem_code} className={`marsonry-question-item footer-none${isSel(pb.problem_code) ? " active" : ""}`}>
                      <div className="marsonry-question-header">
                        <input className="form-check-input" type="checkbox" checked={isSel(pb.problem_code)} onChange={() => toggle(pb)} />
                        <div className="marsonry-question-badge"><span className="blue">{({ basic: "하", normal: "중", advanced: "상" } as Record<string, string>)[pb.difficulty ?? ""] ?? "-"}</span>{pb.concept && <span>{pb.concept}</span>}</div>
                      </div>
                      <div className="marsonry-question-wrap"><div className="marsonry-question-body"><ProblemView problem={pb} /></div></div>
                    </div>
                  ))}
                  {result.items.length === 0 && <p className="f-12 bw5" style={{ padding: 24 }}>단원·난이도를 고르고 검색을 눌러주세요.</p>}
                </div>
                {totalPages > 1 && (<div className="d-flex gap-2 justify-content-center mt-12"><button className="btn btn-default btn-sm" disabled={page <= 1 || pending} onClick={() => doSearch(page - 1)}>이전</button><span className="f-12">{page} / {totalPages}</span><button className="btn btn-default btn-sm" disabled={page >= totalPages || pending} onClick={() => doSearch(page + 1)}>다음</button></div>)}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* STEP 2: 프린트 설정 — 좌측 문제지 미리보기(tplStep3Main) + 우측 원본 프린트 설정 탭(tplStep3Right, print 팝업 #tplPrintOption 마크업 verbatim) */}
      {step === 2 && (
        <>
          <div id="contents" className="include-right pb-24">
            <div id="tplStep3Main">
              <div className="pt-sheet-host">
                <PaperSheet problems={selected} mode="problem"
                  meta={{ title: options.hdr_title ? (options.hdr_title_text || paperName || autoName()) : "", studyName: options.hdr_study ? options.hdr_study_text || undefined : undefined }} />
              </div>
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: STEP3_PRINT }} />
        </>
      )}

      {/* STEP 3: 만들기 완료 — 저장 결과 + 미리보기/인쇄/학생 배정/목록으로 */}
      {step === 3 && created && (
        <div id="contents" className="include-all pb-24">
          <div id="tplStep4Main">
            <div className="accordion accordion-basic">
              <article className="accordion-item">
                <h2 className="accordion-header"><div className="accordion-button">만들기 완료</div></h2>
                <div className="accordion-body">
                  <p className="f-16 fw-700 mb-8">문제지가 만들어졌습니다.</p>
                  <p className="f-12 bw5 fw-400 mb-16"><i className="fa-sharp fa-regular fa-circle-exclamation bw5"></i> 문제지명 <b>{created.name}</b> · 문항 <b>{selected.length}</b>개 · 저장된 문제지는 ‘내 문제지’에서 확인할 수 있습니다.</p>
                  <div className="d-flex gap-2">
                    <button type="button" className={BTN_CANCEL} onClick={() => openLayer(`/popup/paper/preview?ids=${created.id}`)}><i className="fa-sharp fa-regular fa-eye"></i> 미리보기</button>
                    <button type="button" className={BTN_CANCEL} onClick={() => openLayer(`/popup/paper/preview?ids=${created.id}&print=1`)}><i className="fa-sharp fa-solid fa-print"></i> 인쇄</button>
                    <button type="button" className="button__line button__fill--small button__fill--red" onClick={() => openLayer(`/popup/paper/assign?ids=${created.id}`)}><i className="fa-sharp fa-regular fa-user-plus"></i> 학생 배정</button>
                    <button type="button" className={BTN_CANCEL} onClick={goList}><i className="fa-sharp fa-regular fa-list"></i> 목록으로</button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
