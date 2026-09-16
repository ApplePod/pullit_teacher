"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { listStudents, deleteStudents, bulkUpdateStudents, bulkCreateStudents, type StudentRow } from "./studentActions";

const GRADE_OPTS = [["h1", "고1"], ["h2", "고2"], ["h3", "고3"], ["n", "N수"], ["etc", "기타"]] as const;
const GRADE_LABEL: Record<string, string> = { h1: "고1", h2: "고2", h3: "고3", n: "N수", etc: "기타" };
const CHIPS = ["전체", "예비초", "초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3", "고1", "고2", "고3", "기타"];
const LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];
const STATES: [string, string][] = [["active", "정규"], ["paused", "휴회"]];

export function StudentClient() {
  const router = useRouter();
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState(false);
  const [bigModal, setBigModal] = useState(false);
  const [pending, start] = useTransition();

  const load = (s?: string) => start(async () => setRows(await listStudents(s)));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const tgt = e.target as HTMLElement; if (tgt && /INPUT|TEXTAREA/.test(tgt.tagName)) return;
      const text = e.clipboardData?.getData("text") ?? ""; if (!text.trim()) return;
      e.preventDefault(); setBigModal(false);
      start(async () => { const r = await bulkCreateStudents(text); if (r.error) alert(r.error); else { alert(`${r.created}명 등록되었습니다.`); load(); } });
    };
    document.addEventListener("paste", onPaste); return () => document.removeEventListener("paste", onPaste);
  }, []);

  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = rows.length > 0 && checked.size === rows.length;

  const onDelete = () => {
    if (checked.size === 0) return;
    if (!confirm(`선택한 ${checked.size}명을 삭제할까요?`)) return;
    start(async () => { await deleteStudents([...checked]); setChecked(new Set()); load(search); });
  };

  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="listFilter-wrap">
        <ul>
          <li>
            <label className="listFilter-title">검색어</label>
            <div className="listFilter-items">
              <div className="search-select">
                <div className="select__small"><select><option>학생명</option><option>학생 휴대폰</option></select></div>
                <div className="search-input">
                  <input type="search" placeholder="검색어 입력" value={search}
                    onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(search)} />
                  <button onClick={() => load(search)}>검색</button>
                </div>
              </div>
            </div>
          </li>
          <li>
            <label className="listFilter-title">필터 <span className="plus">+</span></label>
            <div className="listFilter-items chip-row">
              {CHIPS.map((c) => <button key={c} className="chip" type="button">{c}</button>)}
            </div>
          </li>
        </ul>
      </div>

      <p className="sample-guide"><a href="#">샘플파일(엑셀csv)다운로드</a> 후 양식에 맞게 입력하여 이 화면에서 ctrl+v 해주세요.</p>

      <div className="d-flex justify-content-between items-center mb-12">
        <div className="d-flex gap-2">
          <button className="btn btn-default" onClick={() => { if (checked.size === 0) { alert("학생을 선택해주세요."); return; } setBulkModal(true); }}>일괄 레벨/학적 상태 변경</button>
          <button className="btn btn-default" onClick={onDelete} disabled={checked.size === 0}>삭제</button>
        </div>
        <div className="d-flex gap-2">
          <button className="button__line button__fill--medium button__fill--red" onClick={() => setBigModal(true)}>학생 대량 등록</button>
          <button className="button__line button__fill--medium button__fill--red" onClick={() => router.push("/management/studentform")}>학생 등록</button>
        </div>
      </div>

      <div className="table-basic">
        <table className="table-layout-basic">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={allChecked}
                onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
              <th className="text-left">학생명</th><th>학생번호</th><th>학생ID</th>
              <th>학생 휴대폰</th><th>학부모 휴대폰</th><th>출결 번호</th><th>등록일</th><th>상세</th><th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><input type="checkbox" checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="text-left">
                  <b>{r.name}</b>
                  <span className="std-sub"> {GRADE_LABEL[r.grade] ?? r.grade}{r.study_level ? ` · ${r.study_level}` : ""}</span>
                </td>
                <td>-</td><td>-</td>
                <td>{r.phone ?? "-"}</td><td>{r.parent_phone ?? "-"}</td><td>-</td>
                <td>{new Date(r.created_at).toLocaleDateString("ko-KR")}</td>
                <td><button className="btn btn-default btn-sm" onClick={() => router.push(`/management/studentform?id=${r.id}`)}>보기</button></td>
                <td><button className="icon-del" onClick={() => { if (confirm("삭제할까요?")) start(async () => { await deleteStudents([r.id]); load(search); }); }}>🗑</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 학생이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="list-count mt-12">총 <b>{rows.length}</b>명</p>

      {bulkModal && <BulkLevelModal ids={[...checked]} onClose={() => setBulkModal(false)} onDone={() => { setBulkModal(false); setChecked(new Set()); load(search); }} start={start} pending={pending} />}
      {bigModal && <BigRegisterModal onClose={() => setBigModal(false)} />}
    </div>
  );
}



/* 원본 student.cshtml 의 modalSetLevels 마크업 그대로 */
function BulkLevelModal({ ids, onClose, onDone, start, pending }: { ids: string[]; onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [level, setLevel] = useState(""); const [state, setState] = useState("");
  const apply = () => start(async () => { const r = await bulkUpdateStudents(ids, { study_level: level || undefined, state: state || undefined }); if (r.error) alert(r.error); else onDone(); });
  return (
    <>
      <div className="modal fade modal-inner-scroll max-450 show" id="modalSetLevels" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">일괄 레벨/상태 변경</h6><button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body"><ul className="list-underline">
            <li className="d-flex justify-content-between"><span className="title">레벨</span>
              <div className="filter-radio">{LEVELS.map((l) => (<span key={l}><input type="radio" name="userStatusLevel" id={`userStatusLevel_${l}`} checked={level === l} onChange={() => setLevel(l)} /><label htmlFor={`userStatusLevel_${l}`}>{l}</label></span>))}</div></li>
            <li className="d-flex justify-content-between" style={{ borderBottom: 0 }}><span className="title">학적 상태</span>
              <div className="filter-radio">{STATES.map(([v, l]) => (<span key={v}><input type="radio" name="userStatus" id={`userStatusCd_${v}`} checked={state === v} onChange={() => setState(v)} /><label htmlFor={`userStatusCd_${v}`} className="w-100">{l}</label></span>))}</div></li>
          </ul></div>
          <div className="modal-footer">
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__line--small button__line--white button__weight--medium" onClick={onClose}>취소</button>
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__fill--small button__fill--secondary" onClick={apply} disabled={pending}>적용</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}

/* 원본 modalStdBigData(안내) 마크업 그대로 — 실제 등록은 화면에서 ctrl+v */
function BigRegisterModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="modal modal--xsmall max-400 fade show" id="modalStdBigData" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">학생 대량 등록</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button></div>
          <div className="modal-body text-center pl-40 pr-40"><p>엑셀파일에서 해당 영역을 복사 후 <br />이 화면에서 바로 ctrl+v를 해주세요.</p></div>
          <div className="modal-footer"><button type="button" className="submit" onClick={onClose}>확인</button></div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
