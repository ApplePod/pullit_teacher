"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchProblems, createPaper } from "../actions";
import { ProblemView, type Problem } from "@/components/ProblemView";

interface Unit { code: string; subject: string; large_name: string; middle_name: string; ord: number }
const DIFFS = [["", "전체 난이도"], ["basic", "하"], ["normal", "중"], ["advanced", "상"]] as const;

export function MakeClient({ units }: { units: Unit[] }) {
  const router = useRouter();
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

  const doSearch = (p = 1) => {
    setPage(p);
    start(async () => {
      const r = await searchProblems({ subject, unit_code: unitCode || undefined, difficulty: difficulty || undefined, page: p });
      setResult(r);
    });
  };

  const toggle = (pb: Problem) => {
    setSelected((cur) => cur.some((x) => x.problem_code === pb.problem_code)
      ? cur.filter((x) => x.problem_code !== pb.problem_code)
      : [...cur, pb]);
  };
  const isSel = (code: string) => selected.some((x) => x.problem_code === code);

  const save = () => {
    setMsg(null);
    start(async () => {
      const r = await createPaper({ name, subject, problem_codes: selected.map((s) => s.problem_code) });
      if (r.error) setMsg(r.error);
      else router.push("/paper/mypaper");
    });
  };

  const totalPages = Math.ceil(result.total / 20);
  return (
    <div className="contens-body make-study">
      <div className="make-grid">
        <section className="make-search">
          <h3 className="section-title">문항 검색</h3>
          <div className="make-filters">
            <select value={subject} onChange={(e) => { setSubject(e.target.value as "math" | "english"); setUnitCode(""); }} className="form-select">
              <option value="math">수학</option>
              <option value="english">영어</option>
            </select>
            <select value={unitCode} onChange={(e) => setUnitCode(e.target.value)} className="form-select">
              <option value="">전체 단원</option>
              {subjectUnits.map((u) => <option key={u.code} value={u.code}>{u.large_name} · {u.middle_name}</option>)}
            </select>
            {subject === "math" && (
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="form-select">
                {DIFFS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            )}
            <button className="button__line button__fill--medium button__fill--red" onClick={() => doSearch(1)} disabled={pending}>검색</button>
          </div>
          <p className="make-count">검색 결과 <b>{result.total.toLocaleString()}</b>건</p>
          <div className="make-list">
            {result.items.map((pb) => (
              <div key={pb.problem_code} className={`make-item${isSel(pb.problem_code) ? " selected" : ""}`}>
                <label className="make-check">
                  <input type="checkbox" checked={isSel(pb.problem_code)} onChange={() => toggle(pb)} />
                </label>
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
            {result.items.length === 0 && <p className="make-empty">단원·난이도를 선택하고 검색을 눌러주세요.</p>}
          </div>
          {totalPages > 1 && (
            <div className="make-pager">
              <button disabled={page <= 1 || pending} onClick={() => doSearch(page - 1)}>이전</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages || pending} onClick={() => doSearch(page + 1)}>다음</button>
            </div>
          )}
        </section>

        <aside className="make-cart">
          <h3 className="section-title">선택한 문항 <span className="make-cart__count">{selected.length}</span></h3>
          <input className="form-control mt-8" placeholder="문제지 이름을 입력해주세요." value={name} onChange={(e) => setName(e.target.value)} />
          {msg && <p className="form-message form-message--error">{msg}</p>}
          <button className="full-btn mt-16" onClick={save} disabled={pending || selected.length === 0}>
            문제지 저장 ({selected.length}문항)
          </button>
          <ul className="make-cart__list mt-16">
            {selected.map((s, i) => (
              <li key={s.problem_code}>
                <span className="make-cart__no">{i + 1}</span>
                <span className="make-cart__code">{s.problem_code}</span>
                <button className="make-cart__del" onClick={() => toggle(s)} aria-label="삭제">×</button>
              </li>
            ))}
            {selected.length === 0 && <li className="make-empty">체크박스로 문항을 담아주세요.</li>}
          </ul>
        </aside>
      </div>
    </div>
  );
}
