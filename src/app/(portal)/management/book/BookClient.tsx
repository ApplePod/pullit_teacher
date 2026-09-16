"use client";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { listBooks, createBook, deleteBook, type BookRow } from "./bookActions";

const SUBJ: Record<string, string> = { math: "수학", english: "영어" };

export function BookClient() {
  const [rows, setRows] = useState<BookRow[]>([]);
  const [modal, setModal] = useState(false);
  const [pending, start] = useTransition();
  const load = () => start(async () => setRows(await listBooks()));
  useEffect(() => { load(); }, []);
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="d-flex justify-content-between items-center mb-16">
        <h3 className="section-title" style={{ margin: 0 }}>사용 교재</h3>
        <button className="button__line button__fill--medium button__fill--red" onClick={() => setModal(true)}>교재 등록</button>
      </div>
      <div className="book-grid">
        {rows.map((r) => (
          <div key={r.id} className="book-card">
            <div className="book-card__head">
              <span className="badge-diff">{r.subject ? SUBJ[r.subject] ?? r.subject : "공통"}</span>
              <button className="icon-del" onClick={() => { if (confirm("삭제할까요?")) start(async () => { await deleteBook(r.id); load(); }); }}>🗑</button>
            </div>
            <h4 className="book-card__name">{r.name}</h4>
            <p className="book-card__pub">{r.publisher ?? "-"}</p>
            <div className="book-card__meta">반 {r.class_count} · 학생 {r.student_count}</div>
          </div>
        ))}
        {rows.length === 0 && <p className="make-empty" style={{ gridColumn: "1/-1" }}>{pending ? "불러오는 중…" : "등록된 교재가 없습니다. ‘교재 등록’으로 추가하세요."}</p>}
      </div>
      {modal && <BookModal onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} start={start} pending={pending} />}
    </div>
  );
}

function BookModal({ onClose, onDone, start, pending }: { onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [f, setF] = useState({ name: "", publisher: "", subject: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const submit = () => { setMsg(null); start(async () => { const r = await createBook(f); if (r.error) setMsg(r.error); else onDone(); }); };
  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal__head"><h4>교재 등록</h4><button onClick={onClose} className="pt-modal__x">×</button></div>
        <div className="pt-modal__body">
          <div className="form-group"><label className="form-label required">교재명</label><input className="form-control" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="교재명을 입력해주세요." /></div>
          <div className="form-group"><label className="form-label">출판사</label><input className="form-control" value={f.publisher} onChange={(e) => setF({ ...f, publisher: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">과목</label>
            <select className="form-control" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>
              <option value="">공통</option><option value="math">수학</option><option value="english">영어</option>
            </select></div>
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
