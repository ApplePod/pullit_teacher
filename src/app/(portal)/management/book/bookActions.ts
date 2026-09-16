"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BookRow { id: string; name: string; publisher: string | null; subject: string | null; class_count: number; student_count: number; created_at: string }
/** 원본 book.cshtml 카드 1장 = 반 1개 */
export interface ClassBookCard {
  id: string; name: string; grade: string | null; student_cnt: number; group_book_cnt: number; group_student_book_cnt: number;
}
export interface MappingBook { id: string; name: string; publisher: string | null; group_names: string; student_id: string }
export interface SimpleStudent { id: string; name: string }

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, center_id: p.center_id } : null;
}

/** 원본 book.cshtml 목록 — 반 단위 카드 */
export async function listClassBookCards(): Promise<ClassBookCard[]> {
  const c = await ctx(); if (!c) return [];
  const { data: classes } = await c.supabase.from("class_group")
    .select("id,name,grade").eq("is_active", true).order("created_at", { ascending: false });
  const { data: cs } = await c.supabase.from("class_student").select("class_id,student_id");
  const { data: ct } = await c.supabase.from("class_textbook").select("class_id,textbook_id");
  const { data: st } = await c.supabase.from("student_textbook").select("student_id,textbook_id");
  const stByStudent = new Map<string, Set<string>>();
  (st ?? []).forEach((r) => {
    const k = r.student_id as string;
    if (!stByStudent.has(k)) stByStudent.set(k, new Set());
    stByStudent.get(k)?.add(r.textbook_id as string);
  });
  return (classes ?? []).map((g) => {
    const members = (cs ?? []).filter((r) => r.class_id === g.id).map((r) => r.student_id as string);
    const indiv = new Set<string>();
    members.forEach((sid) => stByStudent.get(sid)?.forEach((b) => indiv.add(b)));
    return {
      id: g.id as string, name: g.name as string, grade: (g.grade ?? null) as string | null,
      student_cnt: members.length,
      group_book_cnt: (ct ?? []).filter((r) => r.class_id === g.id).length,
      group_student_book_cnt: indiv.size,
    };
  });
}

export async function listBooks(): Promise<BookRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("textbook")
    .select("id,name,publisher,subject,created_at,class_textbook(count),student_textbook(count)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => {
    const t = r as unknown as { class_textbook?: { count: number }[]; student_textbook?: { count: number }[] };
    return { id: r.id, name: r.name, publisher: r.publisher, subject: r.subject, created_at: r.created_at,
      class_count: t.class_textbook?.[0]?.count ?? 0, student_count: t.student_textbook?.[0]?.count ?? 0 };
  }) as BookRow[];
}

export async function createBook(input: { name: string; publisher?: string; subject?: string }): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "교재명을 입력해주세요." };
  const { error } = await c.supabase.from("textbook").insert({
    center_id: c.center_id, name: input.name.trim(), publisher: input.publisher || null, subject: input.subject || null,
  });
  if (error) return { error: "교재 등록에 실패했습니다." };
  revalidatePath("/management/book");
  return {};
}

export async function deleteBook(id: string): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const { error } = await c.supabase.from("textbook").delete().eq("id", id);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/management/book");
  return {};
}

/* ---------- 원본 MappingTextBooks.cshtml (반별/학생별 교재 관리) ---------- */

export async function getClassName(classId: string): Promise<string> {
  const c = await ctx(); if (!c) return "";
  const { data } = await c.supabase.from("class_group").select("name").eq("id", classId).maybeSingle();
  return (data?.name as string) ?? "";
}

export async function listClassStudentsSimple(classId: string): Promise<SimpleStudent[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("class_student").select("student:student_id(id,name)").eq("class_id", classId);
  return (data ?? []).map((r) => (r as unknown as { student: SimpleStudent | null }).student)
    .filter((s): s is SimpleStudent => !!s).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/** 반 공통 교재 목록 (원본 '구분: 반공통') */
export async function listClassTextbooks(classId: string, keyword?: string): Promise<MappingBook[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("class_textbook")
    .select("textbook_id,textbook:textbook_id(id,name,publisher),class_group:class_id(name)").eq("class_id", classId);
  let rows = (data ?? []).map((r) => {
    const t = r as unknown as { textbook: { id: string; name: string; publisher: string | null } | null; class_group: { name?: string } | null };
    return { id: t.textbook?.id ?? "", name: t.textbook?.name ?? "", publisher: t.textbook?.publisher ?? null,
      group_names: t.class_group?.name ?? "", student_id: "" };
  }).filter((r) => r.id);
  const kw = (keyword ?? "").trim();
  if (kw) rows = rows.filter((r) => r.name.includes(kw));
  return rows;
}

/** 학생별 교재 목록 = 반 공통 + 해당 학생 개별 (원본 groupall) */
export async function listStudentTextbooks(classId: string, studentId: string): Promise<MappingBook[]> {
  const c = await ctx(); if (!c) return [];
  const common = await listClassTextbooks(classId);
  const { data } = await c.supabase.from("student_textbook")
    .select("textbook_id,textbook:textbook_id(id,name,publisher)").eq("student_id", studentId);
  const indiv = (data ?? []).map((r) => {
    const t = r as unknown as { textbook: { id: string; name: string; publisher: string | null } | null };
    return { id: t.textbook?.id ?? "", name: t.textbook?.name ?? "", publisher: t.textbook?.publisher ?? null,
      group_names: "", student_id: studentId };
  }).filter((r) => r.id);
  const seen = new Set(indiv.map((r) => r.id));
  return [...indiv, ...common.filter((r) => !seen.has(r.id))];
}

export async function listAllTextbooks(): Promise<{ id: string; name: string; publisher: string | null }[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("textbook").select("id,name,publisher").order("name");
  return (data ?? []) as { id: string; name: string; publisher: string | null }[];
}

export async function setClassTextbooks(classId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (textbookIds.length === 0) return { error: "교재를 선택하세요." };
  const { error } = await c.supabase.from("class_textbook")
    .upsert(textbookIds.map((textbook_id) => ({ class_id: classId, textbook_id, center_id: c.center_id })),
      { onConflict: "class_id,textbook_id" });
  if (error) return { error: "교재 선택에 실패했습니다." };
  revalidatePath("/management/book");
  return {};
}

export async function removeClassTextbooks(classId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (textbookIds.length === 0) return { error: "교재를 선택하세요." };
  const { error } = await c.supabase.from("class_textbook").delete().eq("class_id", classId).in("textbook_id", textbookIds);
  if (error) return { error: "오류가 발생되었습니다." };
  revalidatePath("/management/book");
  return {};
}

export async function setStudentTextbooks(studentId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (textbookIds.length === 0) return { error: "교재를 선택하세요." };
  const { error } = await c.supabase.from("student_textbook")
    .upsert(textbookIds.map((textbook_id) => ({ student_id: studentId, textbook_id, center_id: c.center_id })),
      { onConflict: "student_id,textbook_id" });
  if (error) return { error: "교재 선택에 실패했습니다." };
  revalidatePath("/management/book");
  return {};
}

export async function removeStudentTextbooks(studentId: string, textbookIds: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (textbookIds.length === 0) return { error: "교재를 선택하세요." };
  const { error } = await c.supabase.from("student_textbook").delete().eq("student_id", studentId).in("textbook_id", textbookIds);
  if (error) return { error: "오류가 발생되었습니다." };
  revalidatePath("/management/book");
  return {};
}
