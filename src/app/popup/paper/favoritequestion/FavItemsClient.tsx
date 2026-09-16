"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ProblemView, type Problem } from "@/components/ProblemView";
import { searchProblems } from "@/app/(portal)/paper/actions";
import { listFavItems, setFavItems } from "@/app/(portal)/paper/favoritequestion/favActions";
import { closeLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert } from "@/components/portal/MetaModal";

const DIFF: Record<string, string> = { basic: "하", normal: "중", advanced: "상" };

/** 폴더에 담을 문항 고르기 — 원본 문항 선택 화면(marsonry-question-list) 마크업 */
export function FavItemsClient({ folderId, folderName, units }: { folderId: string; folderName: string; units: { code: string; subject: string; large_name: string; middle_name: string }[] }) {
  const [subject, setSubject] = useState<"math" | "english">("math");
  const [unitCode, setUnitCode] = useState(""); const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: Problem[]; total: number }>({ items: [], total: 0 });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  useEffect(() => { listFavItems(folderId).then((c) => setPicked(new Set(c))); }, [folderId]);
  const subjectUnits = useMemo(() => units.filter((u) => u.subject === subject), [units, subject]);
  const doSearch = (p = 1) => start(async () => { setPage(p); setResult(await searchProblems({ subject, unit_code: unitCode || undefined, difficulty: difficulty || undefined, page: p })); });
  const totalPages = Math.ceil(result.total / 20);
  const save = () => start(async () => {
    const r = await setFavItems(folderId, [...picked]);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장되었습니다."); closeLayerPopup();
  });
  return (
    <div id="wrap">
      <div className="mark-header">
        <ul className="mark-header__top input-title">
          <li><button type="button" onClick={() => closeLayerPopup()}><i className="fa-sharp fa-regular fa-close" aria-hidden="true"></i> 닫기 </button></li>
          <li className="title-area"><span className="f-16 fw-700">{folderName}</span> <span className="f-12 bw5">선택 {picked.size}문항</span></li>
          <li><button type="button" className="button__line button__line--xsmall button__fill--red" style={{ color: "#fff", border: "1px solid rgb(250, 49, 88)" }} disabled={pending} onClick={save}>저장</button></li>
        </ul>
      </div>
      <div id="contents" className="include-all pb-24">
        <div className="accordion accordion-basic mb-16">
          <article className="accordion-item mb-8">
            <h2 className="accordion-header"><div className="accordion-button">문항 조회</div></h2>
            <div className="accordion-body">
              <div className="filter-radio mb-12">
                <input type="radio" name="fsubj" id="fs-math" checked={subject === "math"} onChange={() => { setSubject("math"); setUnitCode(""); }} /><label htmlFor="fs-math">수학</label>
                <input type="radio" name="fsubj" id="fs-eng" checked={subject === "english"} onChange={() => { setSubject("english"); setUnitCode(""); }} /><label htmlFor="fs-eng">영어</label>
              </div>
              <div className="d-flex gap-2 align-items-center mb-12">
                <div className="select__small"><select value={unitCode} onChange={(e) => setUnitCode(e.target.value)}>
                  <option value="">전체 단원</option>{subjectUnits.map((u) => <option key={u.code} value={u.code}>{u.large_name} · {u.middle_name}</option>)}
                </select></div>
                {subject === "math" && (
                  <div className="filter-radio">
                    {([["", "전체"], ["basic", "하"], ["normal", "중"], ["advanced", "상"]] as const).map(([v, l]) => (
                      <span key={v}><input type="radio" name="fdiff" id={`fd-${v}`} checked={difficulty === v} onChange={() => setDifficulty(v)} /><label htmlFor={`fd-${v}`}>{l}</label></span>
                    ))}
                  </div>
                )}
                <button type="button" className="button__line button__line--xsmall button__fill--red" onClick={() => doSearch(1)} disabled={pending}>검색</button>
                <span className="f-12 bw5">검색 결과 <b>{result.total.toLocaleString()}</b>건</span>
              </div>
            </div>
          </article>
          <article className="accordion-item">
            <h2 className="accordion-header"><div className="accordion-button">문항 선택</div></h2>
            <div className="accordion-body">
              <div className="marsonry-question-list item-1">
                {result.items.map((pb) => (
                  <div key={pb.problem_code} className={`marsonry-question-item footer-none${picked.has(pb.problem_code) ? " active" : ""}`}>
                    <div className="marsonry-question-header">
                      <input className="form-check-input" type="checkbox" checked={picked.has(pb.problem_code)}
                        onChange={() => setPicked((s) => { const n = new Set(s); if (n.has(pb.problem_code)) n.delete(pb.problem_code); else n.add(pb.problem_code); return n; })} />
                      <div className="marsonry-question-badge"><span className="blue">{DIFF[pb.difficulty ?? ""] ?? "-"}</span>{pb.concept && <span>{pb.concept}</span>}</div>
                    </div>
                    <div className="marsonry-question-wrap"><div className="marsonry-question-body"><ProblemView problem={pb} /></div></div>
                  </div>
                ))}
                {result.items.length === 0 && <p className="f-12 bw5" style={{ padding: 24 }}>단원·난이도를 고르고 검색을 눌러주세요.</p>}
              </div>
              {totalPages > 1 && (
                <div className="d-flex gap-2 justify-content-center mt-12">
                  <button className="btn btn-default btn-sm" disabled={page <= 1 || pending} onClick={() => doSearch(page - 1)}>이전</button>
                  <span className="f-12">{page} / {totalPages}</span>
                  <button className="btn btn-default btn-sm" disabled={page >= totalPages || pending} onClick={() => doSearch(page + 1)}>다음</button>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
