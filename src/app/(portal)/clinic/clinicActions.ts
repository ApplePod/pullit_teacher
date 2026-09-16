"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AssignmentRow {
  as_id: string; student_id: string; student_name: string; paper_id: string; paper_name: string;
  subject: string; problem_count: number; status: string; correct_count: number | null; score: number | null;
  assigned_at: string; marked_at: string | null;
}

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id } : null;
}

// 문제지를 학생들에게 배정
export async function assignPaper(paper_id: string, student_ids: string[], class_id?: string): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (student_ids.length === 0) return { error: "배정할 학생을 선택해주세요." };
  const { data: asg, error: ae } = await c.supabase.from("assignment")
    .insert({ center_id: c.center_id, paper_id, class_id: class_id || null, assigned_by: c.user.id })
    .select("id").single();
  if (ae || !asg) return { error: "배정에 실패했습니다." };
  const rows = student_ids.map((sid) => ({ center_id: c.center_id, assignment_id: asg.id, student_id: sid, status: "assigned" }));
  const { error: se } = await c.supabase.from("assignment_student").insert(rows);
  if (se) { await c.supabase.from("assignment").delete().eq("id", asg.id); return { error: "학생 배정에 실패했습니다." }; }
  revalidatePath("/clinic/studentmark");
  return {};
}

export async function listAssignments(onlyUnmarked = false): Promise<AssignmentRow[]> {
  const c = await ctx(); if (!c) return [];
  let q = c.supabase.from("assignment_student")
    .select("id,status,correct_count,score,marked_at,student:student_id(id,name),assignment:assignment_id(assigned_at,paper:paper_id(id,name,subject,problem_count))")
    .order("id", { ascending: false });
  if (onlyUnmarked) q = q.neq("status", "marked");
  const { data } = await q;
  return (data ?? []).map((r) => {
    const x = r as unknown as { id: string; status: string; correct_count: number | null; score: number | null; marked_at: string | null;
      student?: { id: string; name: string }; assignment?: { assigned_at: string; paper?: { id: string; name: string; subject: string; problem_count: number } } };
    return {
      as_id: x.id, student_id: x.student?.id ?? "", student_name: x.student?.name ?? "",
      paper_id: x.assignment?.paper?.id ?? "", paper_name: x.assignment?.paper?.name ?? "",
      subject: x.assignment?.paper?.subject ?? "", problem_count: x.assignment?.paper?.problem_count ?? 0,
      status: x.status, correct_count: x.correct_count, score: x.score,
      assigned_at: x.assignment?.assigned_at ?? "", marked_at: x.marked_at,
    };
  }) as AssignmentRow[];
}

export interface MarkProblem { problem_code: string; ord: number; answer_index: number | null; question_preview: string }

export async function loadMarkingSheet(as_id: string): Promise<{ paper_name: string; problems: MarkProblem[]; existing: Record<string, boolean> }> {
  const c = await ctx(); if (!c) return { paper_name: "", problems: [], existing: {} };
  const { data: as } = await c.supabase.from("assignment_student").select("assignment:assignment_id(paper_id,paper:paper_id(name))").eq("id", as_id).maybeSingle();
  const paperId = (as as unknown as { assignment?: { paper_id?: string } })?.assignment?.paper_id;
  const paperName = (as as unknown as { assignment?: { paper?: { name?: string } } })?.assignment?.paper?.name ?? "";
  if (!paperId) return { paper_name: "", problems: [], existing: {} };
  const { data: pp } = await c.supabase.from("paper_problem").select("ord,problem_code").eq("paper_id", paperId).order("ord");
  const codes = (pp ?? []).map((r) => r.problem_code);
  const { data: probs } = await c.supabase.from("problem").select("problem_code,answer_index,question").in("problem_code", codes.length ? codes : ["__none__"]);
  const pmap = new Map((probs ?? []).map((p) => [p.problem_code, p]));
  const problems: MarkProblem[] = (pp ?? []).map((r) => {
    const p = pmap.get(r.problem_code) as { answer_index: number | null; question: { text?: string }[] } | undefined;
    const preview = (p?.question ?? []).map((b) => b.text ?? "").join(" ").slice(0, 40);
    return { problem_code: r.problem_code, ord: r.ord, answer_index: p?.answer_index ?? null, question_preview: preview };
  });
  const { data: existing } = await c.supabase.from("marking").select("problem_code,is_correct").eq("assignment_student_id", as_id);
  const ex: Record<string, boolean> = {};
  (existing ?? []).forEach((m) => { ex[m.problem_code] = m.is_correct as boolean; });
  return { paper_name: paperName, problems, existing: ex };
}

export async function saveMarking(as_id: string, results: { problem_code: string; is_correct: boolean }[]): Promise<{ error?: string; score?: number; correct?: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  await c.supabase.from("marking").delete().eq("assignment_student_id", as_id);
  const rows = results.map((r) => ({ assignment_student_id: as_id, center_id: c.center_id, problem_code: r.problem_code, is_correct: r.is_correct }));
  if (rows.length) { const { error } = await c.supabase.from("marking").insert(rows); if (error) return { error: "채점 저장에 실패했습니다." }; }
  const correct = results.filter((r) => r.is_correct).length;
  const score = results.length ? Math.round((correct / results.length) * 100) : 0;
  await c.supabase.from("assignment_student").update({ status: "marked", correct_count: correct, score, marked_at: new Date().toISOString(), marked_by: c.user.id }).eq("id", as_id);
  revalidatePath("/clinic/studentmark");
  return { score, correct };
}

export async function listAssignableStudents(): Promise<{ id: string; name: string; grade: string }[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").order("name");
  return (data ?? []) as { id: string; name: string; grade: string }[];
}

export interface ReportRow { student_id: string; student_name: string; grade: string; marked: number; assigned: number; avg_score: number | null }
export async function studentReport(): Promise<ReportRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data: students } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").order("name");
  const { data: asg } = await c.supabase.from("assignment_student").select("student_id,status,score");
  const byStudent = new Map<string, { marked: number; assigned: number; sum: number }>();
  (asg ?? []).forEach((a) => {
    const s = byStudent.get(a.student_id) ?? { marked: 0, assigned: 0, sum: 0 };
    s.assigned += 1;
    if (a.status === "marked") { s.marked += 1; s.sum += a.score ?? 0; }
    byStudent.set(a.student_id, s);
  });
  return (students ?? []).map((st) => {
    const s = byStudent.get(st.id) ?? { marked: 0, assigned: 0, sum: 0 };
    return { student_id: st.id, student_name: st.name, grade: st.grade, marked: s.marked, assigned: s.assigned,
      avg_score: s.marked ? Math.round(s.sum / s.marked) : null };
  });
}

export interface ClassMarkRow { class_id: string; class_name: string; total: number; marked: number; avg_score: number | null }
export async function classMarkSummary(): Promise<ClassMarkRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data: classes } = await c.supabase.from("class_group").select("id,name").eq("is_active", true).order("name");
  const { data: asg } = await c.supabase.from("assignment")
    .select("class_id,assignment_student(status,score)").not("class_id", "is", null);
  const byClass = new Map<string, { total: number; marked: number; sum: number }>();
  (asg ?? []).forEach((a) => {
    const rows = (a as unknown as { class_id: string; assignment_student?: { status: string; score: number | null }[] });
    const s = byClass.get(rows.class_id) ?? { total: 0, marked: 0, sum: 0 };
    (rows.assignment_student ?? []).forEach((x) => { s.total += 1; if (x.status === "marked") { s.marked += 1; s.sum += x.score ?? 0; } });
    byClass.set(rows.class_id, s);
  });
  return (classes ?? []).map((cl) => {
    const s = byClass.get(cl.id) ?? { total: 0, marked: 0, sum: 0 };
    return { class_id: cl.id, class_name: cl.name, total: s.total, marked: s.marked, avg_score: s.marked ? Math.round(s.sum / s.marked) : null };
  });
}
