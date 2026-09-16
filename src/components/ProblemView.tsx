"use client";

import { useEffect, useState } from "react";

type Block = { type?: string; text?: string; [k: string]: unknown };
export interface ExplSection { type?: string; blocks?: { type?: string; text?: string }[] }
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
  explanation?: ExplSection[] | null;
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
      s.onload = () => res(); s.onerror = () => res();
      document.head.appendChild(s);
    });
  }
  return katexPromise;
}
function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function renderTex(s: string, ready: boolean): string {
  const k = ready && typeof window !== "undefined" ? window.katex : undefined;
  if (!k) return escapeHtml(s);
  return s.replace(/(\$[^$]+\$)|([^$]+)/g, (_m, tex, text) => {
    if (tex) { try { return k.renderToString(tex.slice(1, -1), { throwOnError: false }); } catch { return escapeHtml(tex); } }
    return escapeHtml(text ?? "");
  });
}

const CIRCLED = ["①", "②", "③", "④", "⑤"];
const EXPL_TITLE: Record<string, string> = { insight: "핵심 인사이트", solution: "풀이", diagnosis: "오답 진단" };

function buildHtml(p: Problem, ready: boolean, opts: { index?: number; showAnswer?: boolean; withExplanation?: boolean }) {
  const q = (p.question || []).map((b) => `<p class="pv-para">${renderTex(b.text ?? "", ready)}</p>`).join("");
  const choices = (p.choices || []).map((c, i) => {
    const on = opts.showAnswer && p.answer_index === i + 1;
    return `<li class="pv-choice${on ? " pv-answer" : ""}">${CIRCLED[i] ?? i + 1} ${renderTex(c, ready)}</li>`;
  }).join("");
  const num = opts.index != null ? `<span class="pv-num">${opts.index}</span>` : "";
  let expl = "";
  if (opts.withExplanation) {
    const ans = p.answer_index ? `${CIRCLED[p.answer_index - 1] ?? p.answer_index}` : (p.answer_text ?? "");
    const secs = (p.explanation || []).map((s) => {
      const body = (s.blocks || []).map((b) => `<p class="pv-para">${renderTex(b.text ?? "", ready)}</p>`).join("");
      return `<div class="pv-expl-sec"><div class="pv-expl-title">${EXPL_TITLE[s.type ?? ""] ?? (s.type ?? "해설")}</div>${body}</div>`;
    }).join("");
    expl = `<div class="pv-expl"><div class="pv-expl-answer">정답 ${ans}</div>${secs}</div>`;
  }
  return `<div class="pv-q">${num}<div class="pv-body">${q}${choices ? `<ol class="pv-choices">${choices}</ol>` : ""}${expl}</div></div>`;
}

export function ProblemView({ problem, index, showAnswer = false, withExplanation = false }: { problem: Problem; index?: number; showAnswer?: boolean; withExplanation?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { loadKatex().then(() => setReady(true)); }, []);
  return <div className="problem-view" dangerouslySetInnerHTML={{ __html: buildHtml(problem, ready, { index, showAnswer, withExplanation }) }} />;
}
