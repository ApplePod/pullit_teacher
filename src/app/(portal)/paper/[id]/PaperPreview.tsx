"use client";

import { useState } from "react";
import { PaperSheet, type SheetMode, type SheetMeta } from "@/components/PaperSheet";
import type { Problem } from "@/components/ProblemView";

const MODES: [SheetMode, string][] = [["problem", "문제지"], ["answer", "정답지"], ["solution", "해설지"]];

export function PaperPreview({ meta, problems }: { meta: SheetMeta; problems: Problem[] }) {
  const [mode, setMode] = useState<SheetMode>("problem");
  return (
    <div className="paper-preview">
      <div className="paper-preview__toolbar">
        <div className="paper-mode">
          {MODES.map(([m, l]) => <button key={m} className={`paper-mode__btn${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>{l}</button>)}
        </div>
        <button className="button__line button__fill--medium button__fill--red" onClick={() => { const f = document.querySelector<HTMLIFrameElement>(".pt-sheet-host iframe"); f?.contentWindow?.focus(); f?.contentWindow?.print(); }}><i className="fa-solid fa-print"></i> 인쇄 / PDF</button>
      </div>
      <PaperSheet problems={problems} meta={meta} mode={mode} />
    </div>
  );
}
