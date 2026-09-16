"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchProblems, createPaper } from "../actions";
import { ProblemView, type Problem } from "@/components/ProblemView";
import { STEP1_AUTO, STEP1_DIRECT, STEP1_BOOK, STEP2_TYPES } from "./steps/wizardHtml";

interface Unit { code: string; subject: string; large_name: string; middle_name: string; ord: number }
type Method = "A" | "D" | "B";
const STEP1: Record<Method, string> = { A: STEP1_AUTO, D: STEP1_DIRECT, B: STEP1_BOOK };
const STEPS = ["기본 설정", "문제지 편집", "프린트 설정", "만들기 완료"];

/** 원본 문제지 만들기(makestudy) — 원본 마크업 그대로 렌더 + 직접출제 경로 동작 */
export function MakeClient({ units }: { units: Unit[] }) {
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
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  // 원본 마크업 안의 출제방식 라디오를 React 상태와 연결
  useEffect(() => {
    const root = host.current; if (!root) return;
    const map: Record<string, Method> = { "radio111-01": "A", "radio111-02": "D", "radio111-03": "B" };
    Object.entries(map).forEach(([id, m]) => { const el = root.querySelector<HTMLInputElement>("#" + id); if (el) el.checked = m === method; });
    const onClick = (e: Event) => {
      const t = e.target as HTMLElement;
      const label = t.closest("label[for]") as HTMLLabelElement | null;
      const id = label?.htmlFor || (t as HTMLInputElement).id;
      if (id && map[id]) { e.preventDefault(); setMethod(map[id]); }
      // 원본의 아코디언 토글
      const btn = t.closest(".accordion-button");
      if (btn) { const body = btn.closest(".accordion-item")?.querySelector(".accordion-collapse"); body?.classList.toggle("show"); }
    };
    root.addEventListener("click", onClick); return () => root.removeEventListener("click", onClick);
  }, [method, step]);

  const subjectUnits = units.filter((u) => u.subject === subject);
  const doSearch = (p = 1) => { setPage(p); start(async () => setResult(await searchProblems({ subject, unit_code: unitCode || undefined, difficulty: difficulty || undefined, page: p }))); };
  const toggle = (pb: Problem) => setSelected((c) => c.some((x) => x.problem_code === pb.problem_code) ? c.filter((x) => x.problem_code !== pb.problem_code) : [...c, pb]);
  const isSel = (code: string) => selected.some((x) => x.problem_code === code);
  const next = () => { setMsg(null); if (step === 0) setStep(1); else if (step === 1 && method === "D" && selected.length === 0) setMsg("문항을 1개 이상 선택해주세요."); else if (step < 3) setStep(step + 1); };
  const prev = () => setStep(Math.max(0, step - 1));
  const finish = () => {
    setMsg(null);
    start(async () => {
      const r = await createPaper({ name: paperName || `직접출제 ${new Date().toLocaleDateString("ko-KR")}`, subject, problem_codes: selected.map((s) => s.problem_code) });
      if (r.error) setMsg(r.error); else router.push(`/paper/${r.id}`);
    });
  };
  const totalPages = Math.ceil(result.total / 20);

  return (
    <div className="makestudy-wrap" ref={host}>
      {/* 원본 상단 바: 닫기 / 문제지명 / 처음부터·임시저장 */}
      <ul className="mark-header__top input-title">
        <li><button type="button" onClick={() => router.push("/paper/mypaper")}><i className="fa-solid fa-angle-left"></i> 닫기</button></li>
        <li className="title-area"><span>문제지명</span>
          <input type="text" className="form-control" maxLength={50} style={{ width: "50%", minWidth: 500 }} placeholder="문제지명을 입력하세요 (미입력 시 자동 생성)" value={paperName} onChange={(e) => setPaperName(e.target.value)} /></li>
        <li>
          <button type="button" onClick={() => { setStep(0); setSelected([]); setResult({ items: [], total: 0 }); setPaperName(""); }}><span className="material-symbols-sharp">restart_alt</span> 처음부터 다시하기</button>
          <button type="button" disabled><span className="material-symbols-sharp">cloud_upload</span> 임시 저장</button>
        </li>
      </ul>
      {/* 원본 스텝퍼 */}
      <div className="preview-header include-right include-left">
        <div className="m-auto d-flex gap-4">
          <button type="button" className="button__fill button__line--xsmall button__line--white button__weight--medium bw6" disabled={step === 0} onClick={prev}><i className="fa-solid fa-angle-left"></i> 이전</button>
          <div className="stepper">
            {STEPS.map((s, i) => (<span key={s} style={{ display: "contents" }}><a href="#" className={i === step ? "current" : i > step ? "pointer-events-none" : ""} onClick={(e) => { e.preventDefault(); if (i < step) setStep(i); }}>{s}</a>{i < STEPS.length - 1 && <div className="dash"></div>}</span>))}
          </div>
          {step < 3 ? (
            <button type="button" className="button__line button__line--xsmall button__fill--red" onClick={next}>다음 <i className="fa-solid fa-angle-right"></i></button>
          ) : (
            <button type="button" className="button__line button__line--xsmall button__fill--red" onClick={finish} disabled={pending}>만들기 완료</button>
          )}
        </div>
      </div>
      {msg && <p className="form-message form-message--error" style={{ margin: "8px 24px" }}>{msg}</p>}

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

      {/* STEP 2: 프린트 설정 (원본 구성 요약) / STEP 3: 완료 */}
      {step === 2 && (
        <div id="contents" className="include-all pb-24">
          <div className="accordion accordion-basic"><article className="accordion-item"><h2 className="accordion-header"><div className="accordion-button">프린트 설정</div></h2>
            <div className="accordion-body"><p className="f-12 bw5">선택 문항 <b>{selected.length}</b>개 · 2단 A4 원본 서식(t_type11)으로 생성됩니다. 문제지/정답/해설은 만들기 완료 후 미리보기에서 전환할 수 있습니다.</p></div></article></div>
        </div>
      )}
      {step === 3 && (
        <div id="contents" className="include-all pb-24">
          <div className="accordion accordion-basic"><article className="accordion-item"><h2 className="accordion-header"><div className="accordion-button">만들기 완료</div></h2>
            <div className="accordion-body"><p className="f-12 bw5">문제지명 <b>{paperName || "(자동 생성)"}</b> · 문항 <b>{selected.length}</b>개. 상단의 ‘만들기 완료’를 누르면 저장되고 미리보기로 이동합니다.</p></div></article></div>
        </div>
      )}
    </div>
  );
}
