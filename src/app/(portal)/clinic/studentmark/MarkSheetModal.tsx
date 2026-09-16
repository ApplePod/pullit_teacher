"use client";

import { useEffect, useState, useTransition } from "react";
import { OriginalModal, BTN_CANCEL, BTN_APPLY } from "@/components/portal/OriginalModal";
import { loadMarkingSheet, saveMarking, type MarkProblem } from "../clinicActions";

const OX = ["①", "②", "③", "④", "⑤"];

/** 채점 화면 — 원본 list-basic-check / button__fill 마크업 그대로 */
export function MarkSheetModal({ asId, studentName, onClose, onDone }: {
  asId: string; studentName: string; onClose: () => void; onDone: () => void;
}) {
  const [problems, setProblems] = useState<MarkProblem[]>([]);
  const [paperName, setPaperName] = useState("");
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [pending, start] = useTransition();
  useEffect(() => {
    let alive = true;
    loadMarkingSheet(asId).then((r) => {
      if (!alive) return;
      setProblems(r.problems); setPaperName(r.paper_name);
      const init: Record<string, boolean> = {};
      r.problems.forEach((p) => { init[p.problem_code] = r.existing[p.problem_code] ?? true; });
      setCorrect(init); setLoading(false);
    });
    return () => { alive = false; };
  }, [asId]);
  const n = problems.filter((p) => correct[p.problem_code]).length;
  const save = () => start(async () => {
    await saveMarking(asId, problems.map((p) => ({ problem_code: p.problem_code, is_correct: !!correct[p.problem_code] })));
    onDone();
  });
  return (
    <OriginalModal id="divMarking" size="max-680" title={<>채점 · {studentName} · {paperName}</>} onClose={onClose}
      footer={<>
        <button type="button" className={BTN_CANCEL} onClick={onClose}>취소</button>
        <button type="button" className={BTN_APPLY} onClick={save} disabled={pending || loading}>채점 저장</button>
      </>}>
      {loading ? <div className="null-item">불러오는 중…</div> : (
        <>
          <p className="f-14 mb-16">정답 <b>{n}</b> / {problems.length} · 예상점수 <b>{problems.length ? Math.round((n / problems.length) * 100) : 0}</b>점</p>
          <div className="list-basic-check pt-0 shadow-none">
            <ul className="table-head gap-3">
              <li style={{ maxWidth: 40 }}>번호</li>
              <li className="title-line">문항</li>
              <li className="align-items-center" style={{ maxWidth: 48 }}>정답</li>
              <li className="align-items-center" style={{ maxWidth: 80 }}>정/오</li>
            </ul>
            {problems.map((p) => (
              <ul key={p.problem_code} className="table-body gap-3 table-hover-background">
                <li style={{ maxWidth: 40 }}>{p.ord}</li>
                <li className="title-line"><span className="line-clamp-1">{p.question_preview}…</span></li>
                <li className="align-items-center" style={{ maxWidth: 48 }}>{p.answer_index ? OX[p.answer_index - 1] : "-"}</li>
                <li className="align-items-center" style={{ maxWidth: 80 }}>
                  <button type="button" className={correct[p.problem_code] ? "button__fill button__fill--xsmall button__fill--secondary w-100" : "button__fill button__line--xsmall button__line--white bw10 w-100"}
                    onClick={() => setCorrect({ ...correct, [p.problem_code]: !correct[p.problem_code] })}>
                    {correct[p.problem_code] ? "정답" : "오답"}
                  </button>
                </li>
              </ul>
            ))}
            {problems.length === 0 && <div className="null-item">등록된 문항이 없습니다.</div>}
          </div>
        </>
      )}
    </OriginalModal>
  );
}
