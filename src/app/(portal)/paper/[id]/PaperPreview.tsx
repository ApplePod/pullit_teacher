"use client";

import { useState } from "react";
import { ProblemView, type Problem } from "@/components/ProblemView";

const CIRCLED = ["①", "②", "③", "④", "⑤"];
type Mode = "paper" | "answer" | "explain";
const MODES: [Mode, string][] = [["paper", "문제지"], ["answer", "정답지"], ["explain", "해설지"]];

export function PaperPreview({ title, problems }: { title: string; problems: Problem[] }) {
  const [mode, setMode] = useState<Mode>("paper");
  return (
    <div className="paper-preview">
      <div className="paper-preview__toolbar">
        <div className="paper-mode">
          {MODES.map(([m, l]) => (
            <button key={m} className={`paper-mode__btn${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-default" onClick={() => window.print()}>인쇄 / PDF</button>
      </div>
      <div className="paper-sheet">
        <h2 className="paper-sheet__title">{title}{mode !== "paper" && <span className="paper-sheet__tag">{mode === "answer" ? "정답" : "해설"}</span>}</h2>
        {mode === "answer" ? (
          <div className="answer-key">
            {problems.map((p, i) => (
              <div key={p.problem_code} className="answer-key__cell">
                <span className="answer-key__no">{i + 1}</span>
                <span className="answer-key__val">{p.answer_index ? CIRCLED[p.answer_index - 1] ?? p.answer_index : (p.answer_text ?? "-")}</span>
              </div>
            ))}
          </div>
        ) : (
          problems.map((p, i) => (
            <div key={p.problem_code} className="paper-sheet__item">
              <ProblemView problem={p} index={i + 1} showAnswer={mode === "explain"} withExplanation={mode === "explain"} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
