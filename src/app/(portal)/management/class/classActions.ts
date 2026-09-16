"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ClassRow {
  id: string; name: string; grade: string | null; room: string | null; memo: string | null;
  teacher_id: string | null; teacher_name: string | null; student_count: number; created_at: string; reg_name: string | null;
}
export interface ClassSchedule { week: string; start_hh: string; start_mm: string; end_hh: string; end_mm: string }
export interface ClassDetail {
  id: string; name: string; grade: string | null; room: string | null; memo: string | null;
  teacher_id: string | null; start_date: string | null; schedule: ClassSchedule[];
}
export interface ClassStudentRow {
  id: string; name: string; grade: string; study_level: string | null; state: string;
}

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id,name").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id, name: p.name } : null;
}

export async function listTeacherOptions(): Promise<{ id: string; name: string }[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("profile").select("id,name").order("name");
  return (data ?? []) as { id: string; name: string }[];
}

export async function listClasses(opts?: { key?: string; keyword?: string; grades?: string[] }): Promise<ClassRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("class_group")
    .select("id,name,grade,room,memo,teacher_id,created_at,teacher:teacher_id(name),class_student(count)")
    .eq("is_active", true).order("created_at", { ascending: false });
  let rows = (data ?? []).map((r) => {
    const t = r as unknown as { teacher?: { name?: string } | null; class_student?: { count: number }[] };
    return {
      id: r.id, name: r.name, grade: r.grade, room: r.room, memo: r.memo, teacher_id: r.teacher_id,
      teacher_name: t.teacher?.name ?? null, student_count: t.class_student?.[0]?.count ?? 0,
      created_at: r.created_at, reg_name: t.teacher?.name ?? null,
    };
  }) as ClassRow[];
  const kw = (opts?.keyword ?? "").trim().toLowerCase();
  if (kw) rows = rows.filter((r) => ((opts?.key === "f_user_nm" ? r.reg_name ?? "" : r.name)).toLowerCase().includes(kw));
  if (opts?.grades?.length) rows = rows.filter((r) => r.grade && (opts.grades as string[]).includes(r.grade));
  return rows;
}

export async function getClassDetail(id: string): Promise<ClassDetail | null> {
  const c = await ctx(); if (!c) return null;
  const { data } = await c.supabase.from("class_group")
    .select("id,name,grade,room,memo,teacher_id,start_date,schedule").eq("id", id).maybeSingle();
  if (!data) return null;
  return { ...data, schedule: (data.schedule ?? []) as ClassSchedule[] } as ClassDetail;
}

export async function createClassGroup(input: {
  name: string; teacher_id?: string; grade?: string; room?: string; memo?: string;
  start_date?: string; schedule?: ClassSchedule[];
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "반 이름을 입력해주세요. " };
  const { error } = await c.supabase.from("class_group").insert({
    center_id: c.center_id, name: input.name.trim(), teacher_id: input.teacher_id || null,
    grade: input.grade || null, room: input.room || null, memo: input.memo || null,
    start_date: input.start_date || null, schedule: input.schedule ?? [],
  });
  if (error) return { error: "반 등록에 실패했습니다." };
  revalidatePath("/management/class");
  return {};
}

export async function updateClassGroup(id: string, input: {
  name: string; teacher_id?: string; grade?: string; room?: string; memo?: string;
  start_date?: string; schedule?: ClassSchedule[];
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "반 이름을 입력해주세요. " };
  const { error } = await c.supabase.from("class_group").update({
    name: input.name.trim(), teacher_id: input.teacher_id || null, grade: input.grade || null,
    room: input.room || null, memo: input.memo || null,
    start_date: input.start_date || null, schedule: input.schedule ?? [],
  }).eq("id", id);
  if (error) return { error: "반 수정에 실패했습니다." };
  revalidatePath("/management/class");
  return {};
}

export async function deleteClasses(ids: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const { error } = await c.supabase.from("class_group").update({ is_active: false }).in("id", ids);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/management/class");
  return {};
}

/* ---------- 반 학생 정보 (원본 tab-pane-4) ---------- */

export async function listClassStudents(classId: string): Promise<ClassStudentRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("class_student")
    .select("student:student_id(id,name,grade,study_level,state)").eq("class_id", classId);
  const rows = (data ?? []).map((r) => (r as unknown as { student: ClassStudentRow | null }).student)
    .filter((s): s is ClassStudentRow => !!s);
  return rows.sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/** 원본 allstudentsiframeforadd.cshtml 대체 — 아직 이 반에 없는 학생 목록 */
export async function listAssignableStudents(classId: string): Promise<ClassStudentRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data: inClass } = await c.supabase.from("class_student").select("student_id").eq("class_id", classId);
  const has = new Set((inClass ?? []).map((r) => r.student_id as string));
  const { data } = await c.supabase.from("student")
    .select("id,name,grade,study_level,state").neq("state", "left").order("name");
  return ((data ?? []) as ClassStudentRow[]).filter((s) => !has.has(s.id));
}

export async function addStudentsToClass(classId: string, studentIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (studentIds.length === 0) return { error: "먼저 학생을 선택해주세요. " };
  const { error } = await c.supabase.from("class_student")
    .upsert(studentIds.map((student_id) => ({ class_id: classId, student_id, center_id: c.center_id })),
      { onConflict: "class_id,student_id" });
  if (error) return { error: "학생 추가에 실패했습니다." };
  revalidatePath("/management/class");
  return {};
}

export async function removeStudentsFromClass(classId: string, studentIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const { error } = await c.supabase.from("class_student")
    .delete().eq("class_id", classId).in("student_id", studentIds);
  if (error) return { error: "제외에 실패했습니다." };
  revalidatePath("/management/class");
  return {};
}

/** 원본 replacestudentsiframe.cshtml(반 이동) 대체 */
export async function moveStudentsToClass(fromClassId: string, toClassId: string, studentIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!toClassId) return { error: "이동할 반을 선택해주세요. " };
  const { error } = await c.supabase.from("class_student")
    .upsert(studentIds.map((student_id) => ({ class_id: toClassId, student_id, center_id: c.center_id })),
      { onConflict: "class_id,student_id" });
  if (error) return { error: "반 이동에 실패했습니다." };
  await c.supabase.from("class_student").delete().eq("class_id", fromClassId).in("student_id", studentIds);
  revalidatePath("/management/class");
  return {};
}
