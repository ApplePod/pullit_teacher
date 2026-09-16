"use client";

import { OriginalModal, BTN_CANCEL, BTN_APPLY, BTN_WHITE_XS, BTN_RED_MD } from "@/components/portal/OriginalModal";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { listClasses, listTeacherOptions, createClassGroup, deleteClasses, type ClassRow } from "./classActions";
import { GRADE_OPTS, GRADE_LABEL } from "@/lib/mgmt-consts";

export function ClassClient() {
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);
  const [pending, start] = useTransition();
  const load = () => start(async () => { setRows(await listClasses()); setTeachers(await listTeacherOptions()); });
  useEffect(() => { load(); }, []);
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const onDelete = () => {
    if (checked.size === 0) return;
    if (!confirm(`선택한 ${checked.size}개 반을 삭제할까요?`)) return;
    start(async () => { await deleteClasses([...checked]); setChecked(new Set()); load(); });
  };
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="listFilter-wrap">
        <ul><li>
          <label className="listFilter-title">검색어</label>
          <div className="listFilter-items"><div className="search-select">
            <div className="select__small"><select><option>반 명</option><option>담당교사</option></select></div>
            <div className="search-input"><input type="search" placeholder="검색어 입력" /><button>검색</button></div>
          </div></div>
        </li></ul>
      </div>
      <div className="d-flex justify-content-between items-center mb-12 mt-16">
        <button className={BTN_WHITE_XS + " button__weight--medium"} onClick={onDelete} disabled={checked.size === 0}>삭제</button>
        <button className={BTN_RED_MD} onClick={() => setModal(true)}>반 등록</button>
      </div>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead><tr>
            <th style={{ width: 40 }}><input type="checkbox" checked={rows.length > 0 && checked.size === rows.length}
              onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
            <th className="text-left">반 명</th><th>학년</th><th>학생 수</th><th>담당교사</th><th>등록일</th><th>메모</th><th>반 학생</th><th>상세</th><th>삭제</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><input type="checkbox" checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="text-left"><b>{r.name}</b></td>
                <td>{r.grade ? GRADE_LABEL[r.grade] ?? r.grade : "-"}</td>
                <td>{r.student_count}</td><td>{r.teacher_name ?? "-"}</td>
                <td>{new Date(r.created_at).toLocaleDateString("ko-KR")}</td>
                <td>{r.memo ?? "-"}</td>
                <td><button className={BTN_WHITE_XS} disabled>학생</button></td>
                <td><button className={BTN_WHITE_XS} disabled>보기</button></td>
                <td><button className="icon-del" onClick={() => { if (confirm("삭제할까요?")) start(async () => { await deleteClasses([r.id]); load(); }); }}>🗑</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 반이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="list-count mt-12">총 <b>{rows.length}</b>개 반</p>
      {modal && <ClassModal teachers={teachers} onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} start={start} pending={pending} />}
    </div>
  );
}

function ClassModal({ teachers, onClose, onDone, start, pending }: {
  teachers: { id: string; name: string }[]; onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean;
}) {
  const [f, setF] = useState({ name: "", teacher_id: "", grade: "h3", room: "", memo: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = () => { setMsg(null); start(async () => { const r = await createClassGroup(f); if (r.error) setMsg(r.error); else onDone(); }); };
  return (
    <OriginalModal id="pt-modal" title={<>반 등록</>} onClose={onClose} footer={<><button className={BTN_WHITE_XS + " button__weight--medium"} onClick={onClose}>목록으로</button>
          <button className={BTN_APPLY} onClick={submit} disabled={pending}>저장하기</button></>}>
        <div>
          <div className="form-group"><label className="form-label required">반 이름</label><input className="form-control" placeholder="반 이름을 입력해주세요." value={f.name} onChange={on("name")} /></div>
          <div className="form-group"><label className="form-label">담당교사</label>
            <select className="form-control" value={f.teacher_id} onChange={on("teacher_id")}>
              <option value="">선택 안 함</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">학년</label>
            <select className="form-control" value={f.grade} onChange={on("grade")}>{GRADE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-group"><label className="form-label">강의실</label><input className="form-control" placeholder="예: 3층 A강의실" value={f.room} onChange={on("room")} /></div>
          <div className="form-group"><label className="form-label">메모</label><textarea className="form-control" value={f.memo} onChange={on("memo")} /></div>
          {msg && <p className="form-message form-message--error">{msg}</p>}
        </div>
      </OriginalModal>
    );
}
