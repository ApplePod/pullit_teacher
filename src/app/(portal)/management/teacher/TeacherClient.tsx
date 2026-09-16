"use client";

import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";

import { OriginalModal, BTN_CANCEL, BTN_APPLY, BTN_WHITE_XS, BTN_RED_MD } from "@/components/portal/OriginalModal";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { listTeachers, createTeacher, deleteTeachers, type TeacherRow } from "./teacherActions";
import { MENU_PERMS } from "@/lib/mgmt-consts";

export function TeacherClient() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);
  const [pending, start] = useTransition();
  const load = () => start(async () => setRows(await listTeachers()));
  useEffect(() => { load(); }, []);
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const permLabel = (m: Record<string, boolean>) => {
    const on = MENU_PERMS.filter(([k]) => m[k]).map(([, l]) => l);
    return on.length === 0 ? "-" : on.length >= MENU_PERMS.length ? "전체" : on.join(", ");
  };
  const onDelete = async () => {
    if (checked.size === 0) return;
    if (!(await metaConfirm(`선택한 ${checked.size}명을 삭제할까요?`))) return;
    start(async () => { const r = await deleteTeachers([...checked]); if (r.error) metaAlert(r.error); setChecked(new Set()); load(); });
  };
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="listFilter-wrap">
        <ul><li>
          <label className="listFilter-title">검색어</label>
          <div className="listFilter-items"><div className="search-select">
            <div className="select__small"><select><option>교사명</option><option>아이디</option></select></div>
            <div className="search-input"><input type="search" placeholder="검색어 입력" /><button>검색</button></div>
          </div></div>
        </li></ul>
      </div>
      <div className="d-flex justify-content-between items-center mb-12 mt-16">
        <div className="d-flex gap-2">
          <button className={BTN_WHITE_XS + " button__weight--medium"} disabled>일괄 사용권한 변경</button>
          <button className={BTN_WHITE_XS + " button__weight--medium"} onClick={onDelete} disabled={checked.size === 0}>삭제</button>
        </div>
        <button className={BTN_RED_MD} onClick={() => setModal(true)}>교사 등록</button>
      </div>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead><tr>
            <th style={{ width: 40 }}><input type="checkbox" checked={rows.length > 0 && checked.size === rows.length}
              onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
            <th className="text-left">교사명</th><th>아이디</th><th>휴대폰</th><th>메뉴권한</th><th>등록일</th><th>관리</th><th>삭제</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><input type="checkbox" checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="text-left"><b>{r.name}</b>{r.role === "owner" && <span className="std-sub"> 원장</span>}</td>
                <td>{r.login_id || "-"}</td><td>{r.phone ?? "-"}</td>
                <td>{r.role === "owner" ? "전체(원장)" : permLabel(r.access_menu)}</td>
                <td>{new Date(r.created_at).toLocaleDateString("ko-KR")}</td>
                <td><button className={BTN_WHITE_XS} disabled>수정</button></td>
                <td>{r.role !== "owner" && <button className="icon-del" onClick={async () => { if (await metaConfirm("삭제할까요?")) start(async () => { const x = await deleteTeachers([r.id]); if (x.error) metaAlert(x.error); load(); }); }}>🗑</button>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 교사가 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="list-count mt-12">총 <b>{rows.length}</b>명</p>
      {modal && <TeacherModal onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} start={start} pending={pending} />}
    </div>
  );
}

function TeacherModal({ onClose, onDone, start, pending }: { onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [f, setF] = useState({ name: "", login_id: "", password: "", phone: "" });
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const allOn = MENU_PERMS.every(([k]) => perms[k]);
  const submit = () => {
    setMsg(null);
    start(async () => { const r = await createTeacher({ ...f, access_menu: perms }); if (r.error) setMsg(r.error); else onDone(); });
  };
  return (
    <OriginalModal id="pt-modal" title={<>교사 등록</>} onClose={onClose} footer={<><button className={BTN_WHITE_XS + " button__weight--medium"} onClick={onClose}>목록으로</button>
          <button className={BTN_APPLY} onClick={submit} disabled={pending}>저장하기</button></>}>
        <div>
          <div className="form-group"><label className="form-label required">교사명</label><input className="form-control" placeholder="교사명을 입력해주세요." value={f.name} onChange={on("name")} /></div>
          <div className="form-group"><label className="form-label required">아이디</label><input className="form-control" placeholder="영문 소문자, 숫자 4~12자리" value={f.login_id} onChange={on("login_id")} /></div>
          <div className="form-group"><label className="form-label required">비밀번호</label><input className="form-control" type="text" placeholder="6자 이상" value={f.password} onChange={on("password")} /></div>
          <div className="form-group"><label className="form-label">휴대폰</label><input className="form-control" placeholder="010-0000-0000" value={f.phone} onChange={on("phone")} /></div>
          <div className="form-group">
            <label className="form-label">메뉴권한
              <button type="button" className={BTN_WHITE_XS} style={{ marginLeft: 8 }}
                onClick={() => setPerms(allOn ? {} : Object.fromEntries(MENU_PERMS.map(([k]) => [k, true])))}>{allOn ? "전체 해제" : "전체 선택"}</button>
            </label>
            <div className="perm-grid">
              {MENU_PERMS.map(([k, l]) => (
                <label key={k} className="perm-chk"><input type="checkbox" checked={!!perms[k]} onChange={(e) => setPerms({ ...perms, [k]: e.target.checked })} /> {l}</label>
              ))}
            </div>
          </div>
          {msg && <p className="form-message form-message--error">{msg}</p>}
        </div>
      </OriginalModal>
    );
}
