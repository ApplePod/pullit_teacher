"use client";
import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { loadIB, studentBooks, toggleStudentBook, type IBStudent, type IBBook } from "./ibActions";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
export function IBClient() {
  const [students, setStudents] = useState<IBStudent[]>([]);
  const [books, setBooks] = useState<IBBook[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  useEffect(() => { start(async () => { const { students, books } = await loadIB(); setStudents(students); setBooks(books); }); }, []);
  const pick = (id: string) => { setSel(id); start(async () => setAssigned(new Set(await studentBooks(id)))); };
  const toggle = (bid: string) => {
    if (!sel) return;
    const on = !assigned.has(bid);
    const n = new Set(assigned); on ? n.add(bid) : n.delete(bid); setAssigned(n);
    start(async () => { await toggleStudentBook(sel, bid, on); });
  };
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <h3 className="section-title">개별 학생 사용 교재 관리</h3>
      <p className="sample-guide">왼쪽에서 학생을 선택하고, 오른쪽에서 사용 교재를 배정/해제합니다.</p>
      <div className="ib-grid">
        <div className="ib-panel">
          <div className="ib-panel__head">학생 ({students.length})</div>
          <div className="ib-list">
            {students.map((s) => (
              <button key={s.id} className={`ib-item${sel === s.id ? " active" : ""}`} onClick={() => pick(s.id)}>
                {s.name} <span className="std-sub">{GRADE_LABEL[s.grade] ?? s.grade}</span>
              </button>
            ))}
            {students.length === 0 && <p className="make-empty">학생이 없습니다.</p>}
          </div>
        </div>
        <div className="ib-panel">
          <div className="ib-panel__head">사용 교재 {sel ? `· 배정 ${assigned.size}` : ""}</div>
          <div className="ib-list">
            {!sel && <p className="make-empty">학생을 선택하세요.</p>}
            {sel && books.map((b) => (
              <label key={b.id} className="ib-book">
                <input type="checkbox" checked={assigned.has(b.id)} onChange={() => toggle(b.id)} />
                <span>{b.name}{b.publisher ? ` · ${b.publisher}` : ""}</span>
              </label>
            ))}
            {sel && books.length === 0 && <p className="make-empty">등록된 교재가 없습니다. [사용교재]에서 먼저 등록하세요.</p>}
          </div>
        </div>
      </div>
      {pending && <p className="sample-guide">처리 중…</p>}
    </div>
  );
}
