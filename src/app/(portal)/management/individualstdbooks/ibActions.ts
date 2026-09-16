"use server";

import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/supabase/claims";
import { createClient } from "@/lib/supabase/server";

export interface IBStudent { id: string; name: string; grade: string; state: string; level: string | null; className: string; classId: string | null; bookCount: number }
export interface IBBook { id: string; name: string; publisher: string | null; subject: string | null; kind: string; userCount: number }
export interface IBClass { id: string; name: string }

async function ctx() {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, center_id: p.center_id as string } : null;
}

/** 학생 목록 + 소속반 + 사용 교재 수 (원본 개별학생교재 상단 목록) */
export async function loadIB(): Promise<{ students: IBStudent[]; classes: IBClass[] }> {
  const c = await ctx(); if (!c) return { students: [], classes: [] };
  const [stdRes, clsRes, csRes, stRes] = await Promise.all([
    c.supabase.from("student").select("id,name,grade,state,study_level").order("name"),
    c.supabase.from("class_group").select("id,name").order("name"),
    c.supabase.from("class_student").select("class_id,student_id"),
    c.supabase.from("student_textbook").select("student_id,textbook_id"),
  ]);
  const classes = (clsRes.data ?? []).map((x) => ({ id: x.id as string, name: x.name as string }));
  const clsOf = new Map<string, { id: string; name: string }>();
  for (const r of csRes.data ?? []) {
    const cl = classes.find((x) => x.id === r.class_id); if (cl) clsOf.set(r.student_id as string, cl);
  }
  const bookCount = new Map<string, number>();
  for (const r of stRes.data ?? []) bookCount.set(r.student_id as string, (bookCount.get(r.student_id as string) ?? 0) + 1);
  const students = (stdRes.data ?? []).map((s) => ({
    id: s.id as string, name: s.name as string, grade: s.grade as string, state: s.state as string,
    level: (s.study_level as string | null) ?? null,
    className: clsOf.get(s.id as string)?.name ?? "임시 미지정반",
    classId: clsOf.get(s.id as string)?.id ?? null,
    bookCount: bookCount.get(s.id as string) ?? 0,
  }));
  return { students, classes };
}

/** 학생이 사용 중인 교재 (구분: 개별 배정 / 반 배정) */
export async function studentBooks(studentId: string): Promise<IBBook[]> {
  const c = await ctx(); if (!c) return [];
  const [stRes, allRes, csRes, ctRes] = await Promise.all([
    c.supabase.from("student_textbook").select("textbook_id").eq("student_id", studentId),
    c.supabase.from("textbook").select("id,name,publisher,subject"),
    c.supabase.from("class_student").select("class_id").eq("student_id", studentId),
    c.supabase.from("class_textbook").select("class_id,textbook_id"),
  ]);
  const { data: users } = await c.supabase.from("student_textbook").select("textbook_id,student_id");
  const userCount = new Map<string, number>();
  for (const r of users ?? []) userCount.set(r.textbook_id as string, (userCount.get(r.textbook_id as string) ?? 0) + 1);
  const myClasses = new Set((csRes.data ?? []).map((r) => r.class_id as string));
  const classBooks = new Set((ctRes.data ?? []).filter((r) => myClasses.has(r.class_id as string)).map((r) => r.textbook_id as string));
  const mine = new Set((stRes.data ?? []).map((r) => r.textbook_id as string));
  return (allRes.data ?? []).filter((b) => mine.has(b.id as string)).map((b) => ({
    id: b.id as string, name: b.name as string, publisher: (b.publisher as string | null) ?? null,
    subject: (b.subject as string | null) ?? null,
    kind: classBooks.has(b.id as string) ? "반 교재" : "개별",
    userCount: userCount.get(b.id as string) ?? 0,
  }));
}

/** 교재 선택 모달용 — 학원의 전체 교재 */
export async function allBooks(): Promise<IBBook[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("textbook").select("id,name,publisher,subject").order("name");
  return (data ?? []).map((b) => ({
    id: b.id as string, name: b.name as string, publisher: (b.publisher as string | null) ?? null,
    subject: (b.subject as string | null) ?? null, kind: "개별", userCount: 0,
  }));
}

export async function setStudentBooks(studentId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!textbookIds.length) return {};
  const { error } = await c.supabase.from("student_textbook").upsert(
    textbookIds.map((textbook_id) => ({ student_id: studentId, textbook_id, center_id: c.center_id })),
    { onConflict: "student_id,textbook_id" },
  );
  if (error) return { error: "교재 배정에 실패했습니다." };
  revalidatePath("/management/individualstdbooks");
  return {};
}

export async function removeStudentBooks(studentId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!textbookIds.length) return {};
  const { error } = await c.supabase.from("student_textbook").delete().eq("student_id", studentId).in("textbook_id", textbookIds);
  if (error) return { error: "교재 해제에 실패했습니다." };
  revalidatePath("/management/individualstdbooks");
  return {};
}
