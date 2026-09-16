"use client";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { listStudents, createStudent, deleteStudents, bulkUpdateStudents, bulkCreateStudents, type StudentRow } from "./studentActions";

const GRADE_OPTS = [["h1", "고1"], ["h2", "고2"], ["h3", "고3"], ["n", "N수"], ["etc", "기타"]] as const;
const GRADE_LABEL: Record<string, string> = { h1: "고1", h2: "고2", h3: "고3", n: "N수", etc: "기타" };
const CHIPS = ["전체", "예비초", "초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3", "고1", "고2", "고3", "기타"];
const LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];
const STATES: [string, string][] = [["active", "정규"], ["paused", "휴회"]];

export function StudentClient() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [bigModal, setBigModal] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const load = (s?: string) => start(async () => setRows(await listStudents(s)));
  useEffect(() => { load(); }, []);

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
          <button className="button__line button__fill--medium button__fill--red" onClick={() => { setMsg(null); setModal(true); }}>학생 등록</button>
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
                <td><button className="btn btn-default btn-sm" disabled>보기</button></td>
                <td><button className="icon-del" onClick={() => { if (confirm("삭제할까요?")) start(async () => { await deleteStudents([r.id]); load(search); }); }}>🗑</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 학생이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="list-count mt-12">총 <b>{rows.length}</b>명</p>

      {modal && <RegisterModal onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} msg={msg} setMsg={setMsg} pending={pending} start={start} />}
      {bulkModal && <BulkLevelModal ids={[...checked]} onClose={() => setBulkModal(false)} onDone={() => { setBulkModal(false); setChecked(new Set()); load(search); }} start={start} pending={pending} />}
      {bigModal && <BigRegisterModal onClose={() => setBigModal(false)} onDone={() => { setBigModal(false); load(); }} start={start} pending={pending} />}
    </div>
  );
}

function RegisterModal({ onClose, onDone, msg, setMsg, pending, start }: {
  onClose: () => void; onDone: () => void; msg: string | null;
  setMsg: (s: string | null) => void; pending: boolean; start: (fn: () => Promise<void>) => void;
}) {
  const [f, setF] = useState({ name: "", grade: "h3", phone: "", parent_name: "", parent_phone: "", address: "", memo: "" });
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    setMsg(null);
    start(async () => {
      const r = await createStudent(f);
      if (r.error) setMsg(r.error); else onDone();
    });
  };
  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal__head"><h4>학생 등록</h4><button onClick={onClose} className="pt-modal__x">×</button></div>
        <div className="pt-modal__body">
          <div className="form-group"><label className="form-label required">학생명</label>
            <input className="form-control" placeholder="학생명을 입력해주세요." value={f.name} onChange={on("name")} /></div>
          <div className="form-group"><label className="form-label">학년</label>
            <select className="form-control" value={f.grade} onChange={on("grade")}>{GRADE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-group"><label className="form-label">학생 휴대폰</label>
            <input className="form-control" placeholder="010-0000-0000" value={f.phone} onChange={on("phone")} /></div>
          <div className="form-group"><label className="form-label">보호자명</label>
            <input className="form-control" placeholder="보호자명을 입력해주세요" value={f.parent_name} onChange={on("parent_name")} /></div>
          <div className="form-group"><label className="form-label">보호자 휴대폰</label>
            <input className="form-control" placeholder="010-0000-0000" value={f.parent_phone} onChange={on("parent_phone")} /></div>
          <div className="form-group"><label className="form-label">주소</label>
            <input className="form-control" value={f.address} onChange={on("address")} /></div>
          <div className="form-group"><label className="form-label">상담 메모</label>
            <textarea className="form-control" placeholder="특이사항을 메모로 기록해주세요. (최대 100자)" maxLength={100} value={f.memo} onChange={on("memo")} /></div>
          {msg && <p className="form-message form-message--error">{msg}</p>}
        </div>
        <div className="pt-modal__foot">
          <button className="btn btn-default" onClick={onClose}>목록으로</button>
          <button className="full-btn" style={{ width: "auto", padding: "0 24px" }} onClick={submit} disabled={pending}>저장하기</button>
        </div>
      </div>
    </div>
  );
}


function BulkLevelModal({ ids, onClose, onDone, start, pending }: { ids: string[]; onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [level, setLevel] = useState(""); const [state, setState] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const submit = () => { setMsg(null); start(async () => { const r = await bulkUpdateStudents(ids, { study_level: level || undefined, state: state || undefined }); if (r.error) setMsg(r.error); else onDone(); }); };
  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal__head"><h4>일괄 레벨/학적 상태 변경 ({ids.length}명)</h4><button onClick={onClose} className="pt-modal__x">×</button></div>
        <div className="pt-modal__body">
          <div className="form-group"><label className="form-label">레벨</label>
            <div className="chip-row">{LEVELS.map((l) => <button key={l} type="button" className={`chip${level === l ? " chip-on" : ""}`} onClick={() => setLevel(level === l ? "" : l)}>{l}</button>)}</div></div>
          <div className="form-group"><label className="form-label">학적 상태</label>
            <div className="chip-row">{STATES.map(([v, l]) => <button key={v} type="button" className={`chip${state === v ? " chip-on" : ""}`} onClick={() => setState(state === v ? "" : v)}>{l}</button>)}</div></div>
          {msg && <p className="form-message form-message--error">{msg}</p>}
        </div>
        <div className="pt-modal__foot"><button className="btn btn-default" onClick={onClose}>취소</button><button className="full-btn" style={{ width: "auto", padding: "0 24px" }} onClick={submit} disabled={pending}>변경</button></div>
      </div>
    </div>
  );
}

function BigRegisterModal({ onClose, onDone, start, pending }: { onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [text, setText] = useState(""); const [msg, setMsg] = useState<string | null>(null);
  const submit = () => { setMsg(null); start(async () => { const r = await bulkCreateStudents(text); if (r.error) setMsg(r.error); else { setMsg(null); onDone(); } }); };
  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal__head"><h4>학생 대량 등록</h4><button onClick={onClose} className="pt-modal__x">×</button></div>
        <div className="pt-modal__body">
          <p className="sample-guide">엑셀에서 <b>학생명, 학년, 휴대폰, 보호자명, 보호자휴대폰</b> 순으로 복사해 붙여넣으세요. (탭/콤마 구분, 한 줄에 한 명)</p>
          <textarea className="form-control" rows={8} placeholder={"홍길동\t고3\t010-1111-2222\t홍부모\t010-3333-4444"} value={text} onChange={(e) => setText(e.target.value)} />
          {msg && <p className="form-message form-message--error">{msg}</p>}
        </div>
        <div className="pt-modal__foot"><button className="btn btn-default" onClick={onClose}>취소</button><button className="full-btn" style={{ width: "auto", padding: "0 24px" }} onClick={submit} disabled={pending}>등록</button></div>
      </div>
    </div>
  );
}
