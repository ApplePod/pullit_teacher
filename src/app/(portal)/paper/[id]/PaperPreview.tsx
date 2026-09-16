"use client";

import { useState } from "react";
import { ProblemView, type Problem } from "@/components/ProblemView";

export function PaperPreview({ title, problems }: { title: string; problems: Problem[] }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="paper-preview">
      <div className="paper-preview__toolbar">
        <label className="paper-preview__toggle">
          <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} /> 정답 표시
        </label>
        <button className="btn btn-default" onClick={() => window.print()}>인쇄 / PDF</button>
      </div>
      <div className="paper-sheet">
        <h2 className="paper-sheet__title">{title}</h2>
        {problems.map((p, i) => (
          <div key={p.problem_code} className="paper-sheet__item">
            <ProblemView problem={p} index={i + 1} showAnswer={showAnswer} />
          </div>
        ))}
      </div>
    </div>
  );
}
