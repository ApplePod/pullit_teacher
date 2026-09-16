"use client";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { listAssignments, loadMarkingSheet, saveMarking, type AssignmentRow, type MarkProblem } from "../clinicActions";

const SUBJ: Record<string, string> = { math: "수학", english: "영어" };
const STATUS: Record<string, string> = { assigned: "미채점", submitted: "제출", marked: "채점완료" };

export function StudentMarkClient() {
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [marking, setMarking] = useState<AssignmentRow | null>(null);
  const [pending, start] = useTransition();
  const load = () => start(async () => setRows(await listAssignments()));
  useEffect(() => { load(); }, []);
  return (
    <div className="contens-body">
      <ListTab tabs={CLINIC_TABS} className="mb-24" />
      <div className="alert alert-blue fade show p-3 mb-16" role="alert">
        <div className="d-flex gap-1"><span className="material-symbols-sharp">error</span>
          <div className="msg">문제지를 학생에게 배정한 뒤 여기서 채점합니다. 배정은 [문제지 보관함 → 내 문제지 → 학생 배정]에서 합니다.</div></div>
      </div>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead><tr>
            <th className="text-left">문제지명</th><th>학생</th><th>과목</th><th>문항수</th>
            <th>배정일</th><th>정답/오답(점수)</th><th>상태</th><th>채점</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.as_id}>
                <td className="text-left"><b>{r.paper_name}</b></td>
                <td>{r.student_name}</td><td>{SUBJ[r.subject] ?? r.subject}</td><td>{r.problem_count}</td>
                <td>{r.assigned_at ? new Date(r.assigned_at).toLocaleDateString("ko-KR") : "-"}</td>
                <td>{r.status === "marked" ? `${r.correct_count}/${r.problem_count} (${r.score}점)` : "-"}</td>
                <td><span className={`mark-status mark-${r.status}`}>{STATUS[r.status] ?? r.status}</span></td>
                <td><button className="btn btn-default btn-sm" onClick={() => setMarking(r)}>{r.status === "marked" ? "재채점" : "채점"}</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "배정된 문제지가 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
      {marking && <MarkModal row={marking} onClose={() => setMarking(null)} onDone={() => { setMarking(null); load(); }} />}
    </div>
  );
}

function MarkModal({ row, onClose, onDone }: { row: AssignmentRow; onClose: () => void; onDone: () => void }) {
  const [problems, setProblems] = useState<MarkProblem[]>([]);
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    start(async () => {
      const { problems, existing } = await loadMarkingSheet(row.as_id);
      setProblems(problems);
      const init: Record<string, boolean> = {};
      problems.forEach((p) => { init[p.problem_code] = existing[p.problem_code] ?? true; });
      setCorrect(init); setLoading(false);
    });
  }, [row.as_id]);
  const correctCount = problems.filter((p) => correct[p.problem_code]).length;
  const save = () => start(async () => {
    await saveMarking(row.as_id, problems.map((p) => ({ problem_code: p.problem_code, is_correct: !!correct[p.problem_code] })));
    onDone();
  });
  return (
    <div className="pt-modal-backdrop" onClick={onClose}>
      <div className="pt-modal" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="pt-modal__head"><h4>채점 · {row.student_name} · {row.paper_name}</h4><button onClick={onClose} className="pt-modal__x">×</button></div>
        <div className="pt-modal__body">
          {loading ? <p className="make-empty">불러오는 중…</p> : (
            <>
              <p className="mark-summary">정답 <b>{correctCount}</b> / {problems.length} · 예상점수 <b>{problems.length ? Math.round(correctCount / problems.length * 100) : 0}</b>점</p>
              <table className="mark-table">
                <thead><tr><th>번호</th><th className="text-left">문항</th><th>정답</th><th>정/오</th></tr></thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.problem_code}>
                      <td>{p.ord}</td>
                      <td className="text-left mark-preview">{p.question_preview}…</td>
                      <td>{p.answer_index ? ["①","②","③","④","⑤"][p.answer_index - 1] : "-"}</td>
                      <td>
                        <button className={`mark-toggle ${correct[p.problem_code] ? "on-o" : "on-x"}`}
                          onClick={() => setCorrect({ ...correct, [p.problem_code]: !correct[p.problem_code] })}>
                          {correct[p.problem_code] ? "○" : "✕"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="pt-modal__foot">
          <button className="btn btn-default" onClick={onClose}>취소</button>
          <button className="full-btn" style={{ width: "auto", padding: "0 24px" }} onClick={save} disabled={pending || loading}>채점 저장</button>
        </div>
      </div>
    </div>
  );
}
