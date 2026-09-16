"use client";

import { useEffect, useState } from "react";

type Block = { type?: string; text?: string; [k: string]: unknown };
export interface Problem {
  problem_code: string;
  subject: string;
  unit_code: string;
  question: Block[];
  choices: string[] | null;
  answer_index: number | null;
  answer_text: string | null;
  difficulty: string | null;
  score: number | null;
  concept: string | null;
}

declare global { interface Window { katex?: { renderToString(tex: string, opts?: object): string } } }

let katexPromise: Promise<void> | null = null;
function loadKatex(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.katex) return Promise.resolve();
  if (!katexPromise) {
    katexPromise = new Promise<void>((res) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js";
      s.onload = () => res();
      s.onerror = () => res();
      document.head.appendChild(s);
    });
  }
  return katexPromise;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderTex(s: string, ready: boolean): string {
  const k = ready && typeof window !== "undefined" ? window.katex : undefined;
  if (!k) return escapeHtml(s);
  return s.replace(/(\$[^$]+\$)|([^$]+)/g, (_m, tex, text) => {
    if (tex) {
      try { return k.renderToString(tex.slice(1, -1), { throwOnError: false }); }
      catch { return escapeHtml(tex); }
    }
    return escapeHtml(text ?? "");
  });
}
function buildHtml(p: Problem, ready: boolean, index?: number, showAnswer?: boolean) {
  const q = (p.question || []).map((b) => `<p class="pv-para">${renderTex(b.text ?? "", ready)}</p>`).join("");
  const choices = (p.choices || []).map((c, i) => {
    const on = showAnswer && p.answer_index === i + 1;
    return `<li class="pv-choice${on ? " pv-answer" : ""}">${["①","②","③","④","⑤"][i] ?? i + 1} ${renderTex(c, ready)}</li>`;
  }).join("");
  const num = index != null ? `<span class="pv-num">${index}</span>` : "";
  return `<div class="pv-q">${num}<div class="pv-body">${q}${choices ? `<ol class="pv-choices">${choices}</ol>` : ""}</div></div>`;
}

export function ProblemView({ problem, index, showAnswer = false }: { problem: Problem; index?: number; showAnswer?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { loadKatex().then(() => setReady(true)); }, []);
  return (
    <div className="problem-view" dangerouslySetInnerHTML={{ __html: buildHtml(problem, ready, index, showAnswer) }} />
  );
}
