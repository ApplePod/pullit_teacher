"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchProblems, createPaper } from "../actions";
import { ProblemView, type Problem } from "@/components/ProblemView";

interface Unit { code: string; subject: string; large_name: string; middle_name: string; ord: number }
const DIFFS = [["", "전체"], ["basic", "하"], ["normal", "중"], ["advanced", "상"]] as const;

export function MakeClient({ units }: { units: Unit[] }) {
  const router = useRouter();
  const [method, setMethod] = useState<"D" | "A" | "B">("D");
  const [subject, setSubject] = useState<"math" | "english">("math");
  const [unitCode, setUnitCode] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: Problem[]; total: number }>({ items: [], total: 0 });
  const [selected, setSelected] = useState<Problem[]>([]);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const subjectUnits = units.filter((u) => u.subject === subject);
  const doSearch = (p = 1) => { setPage(p); start(async () => setResult(await searchProblems({ subject, unit_code: unitCode || undefined, difficulty: difficulty || undefined, page: p }))); };
  const toggle = (pb: Problem) => setSelected((c) => c.some((x) => x.problem_code === pb.problem_code) ? c.filter((x) => x.problem_code !== pb.problem_code) : [...c, pb]);
  const isSel = (code: string) => selected.some((x) => x.problem_code === code);
  const save = () => { setMsg(null); start(async () => { const r = await createPaper({ name, subject, problem_codes: selected.map((s) => s.problem_code) }); if (r.error) setMsg(r.error); else router.push("/paper/mypaper"); }); };
  const totalPages = Math.ceil(result.total / 20);

  return (
    <div className="contens-body make-wizard">
      <div className="accordion accordion-basic">
        {/* 1. 출제방식 선택 */}
        <article className="accordion-item accordion-row mb-8">
          <h2 className="accordion-header"><div className="accordion-button">출제방식 선택</div></h2>
          <div className="accordion-body">
            <div className="filter-radio mb-12">
              <input type="radio" name="method" id="m-D" checked={method === "D"} onChange={() => setMethod("D")} /><label htmlFor="m-D">직접 출제</label>
              <input type="radio" name="method" id="m-A" checked={method === "A"} onChange={() => setMethod("A")} /><label htmlFor="m-A">자동 출제</label>
              <input type="radio" name="method" id="m-B" checked={method === "B"} onChange={() => setMethod("B")} /><label htmlFor="m-B">교재매칭</label>
            </div>
            <p className="f-12 bw5 fw-400">
              {method === "D" && "문항을 조회하여 직접 보면서 하나하나 선택한 문제들로 문제지를 만듭니다."}
              {method === "A" && "학년·학기·단원 등을 선택하여 자동으로 문제지를 만듭니다. (준비 중)"}
              {method === "B" && "교과서·참고서 등 교재와 매칭하여 문제지를 만듭니다. (준비 중)"}
            </p>
          </div>
        </article>

        {method !== "D" ? (
          <article className="accordion-item accordion-row"><div className="accordion-body"><p className="make-empty">해당 출제방식은 준비 중입니다. ‘직접 출제’를 이용해주세요.</p></div></article>
        ) : (
          <>
            {/* 2. 문항 조회 */}
            <article className="accordion-item accordion-row mb-8">
              <h2 className="accordion-header"><div className="accordion-button">문항 조회</div></h2>
              <div className="accordion-body">
                <div className="wizard-field"><span className="wizard-label">과목</span>
                  <div className="filter-radio">
                    <input type="radio" name="subj" id="s-math" checked={subject === "math"} onChange={() => { setSubject("math"); setUnitCode(""); }} /><label htmlFor="s-math">수학</label>
                    <input type="radio" name="subj" id="s-eng" checked={subject === "english"} onChange={() => { setSubject("english"); setUnitCode(""); }} /><label htmlFor="s-eng">영어</label>
                  </div>
                </div>
                <div className="wizard-field"><span className="wizard-label">단원</span>
                  <select className="form-control" style={{ maxWidth: 420 }} value={unitCode} onChange={(e) => setUnitCode(e.target.value)}>
                    <option value="">전체 단원</option>
                    {subjectUnits.map((u) => <option key={u.code} value={u.code}>{u.large_name} · {u.middle_name}</option>)}
                  </select>
                </div>
                {subject === "math" && (
                  <div className="wizard-field"><span className="wizard-label">난이도</span>
                    <div className="filter-radio">
                      {DIFFS.map(([v, l]) => (<span key={v}><input type="radio" name="diff" id={`d-${v}`} checked={difficulty === v} onChange={() => setDifficulty(v)} /><label htmlFor={`d-${v}`}>{l}</label></span>))}
                    </div>
                  </div>
                )}
                <div className="mt-12"><button className="button__line button__fill--medium button__fill--red" onClick={() => doSearch(1)} disabled={pending}>문항 조회</button>
                  <span className="make-count ml-4">검색 결과 <b>{result.total.toLocaleString()}</b>건</span></div>
              </div>
            </article>

            {/* 3. 문항 선택 */}
            <article className="accordion-item accordion-row">
              <h2 className="accordion-header"><div className="accordion-button">문항 선택 <span className="make-cart__count">{selected.length}</span></div></h2>
              <div className="accordion-body">
                <div className="make-list">
                  {result.items.map((pb) => (
                    <div key={pb.problem_code} className={`make-item${isSel(pb.problem_code) ? " selected" : ""}`}>
                      <label className="make-check"><input type="checkbox" checked={isSel(pb.problem_code)} onChange={() => toggle(pb)} /></label>
                      <div className="make-item__body">
                        <div className="make-item__meta">
                          <span className="badge-diff">{({ basic: "하", normal: "중", advanced: "상" } as Record<string, string>)[pb.difficulty ?? ""] ?? ""}</span>
                          {pb.concept && <span className="make-concept">{pb.concept}</span>}
                          <span className="make-code">{pb.problem_code}</span>
                        </div>
                        <ProblemView problem={pb} />
                      </div>
                    </div>
                  ))}
                  {result.items.length === 0 && <p className="make-empty">단원·난이도를 고르고 ‘문항 조회’를 눌러주세요.</p>}
                </div>
                {totalPages > 1 && (
                  <div className="make-pager">
                    <button disabled={page <= 1 || pending} onClick={() => doSearch(page - 1)}>이전</button>
                    <span>{page} / {totalPages}</span>
                    <button disabled={page >= totalPages || pending} onClick={() => doSearch(page + 1)}>다음</button>
                  </div>
                )}
              </div>
            </article>
          </>
        )}
      </div>

      {/* 하단 저장 바 */}
      {method === "D" && (
        <div className="wizard-savebar">
          <input className="form-control" placeholder="문제지 이름을 입력해주세요." value={name} onChange={(e) => setName(e.target.value)} />
          {msg && <span className="form-message form-message--error" style={{ margin: 0 }}>{msg}</span>}
          <button className="full-btn" style={{ width: "auto", padding: "0 28px" }} onClick={save} disabled={pending || selected.length === 0}>문제지 저장 ({selected.length}문항)</button>
        </div>
      )}
    </div>
  );
}
