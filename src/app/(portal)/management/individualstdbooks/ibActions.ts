"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export interface IBStudent { id: string; name: string; grade: string }
export interface IBBook { id: string; name: string; publisher: string | null }
async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, center_id: p.center_id } : null;
}
export async function loadIB(): Promise<{ students: IBStudent[]; books: IBBook[] }> {
  const c = await ctx(); if (!c) return { students: [], books: [] };
  const { data: students } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").order("name");
  const { data: books } = await c.supabase.from("textbook").select("id,name,publisher").order("name");
  return { students: (students ?? []) as IBStudent[], books: (books ?? []) as IBBook[] };
}
export async function studentBooks(studentId: string): Promise<string[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("student_textbook").select("textbook_id").eq("student_id", studentId);
  return (data ?? []).map((r) => r.textbook_id as string);
}
export async function toggleStudentBook(studentId: string, textbookId: string, on: boolean): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (on) {
    const { error } = await c.supabase.from("student_textbook").upsert(
      { student_id: studentId, textbook_id: textbookId, center_id: c.center_id }, { onConflict: "student_id,textbook_id" });
    if (error) return { error: "배정에 실패했습니다." };
  } else {
    await c.supabase.from("student_textbook").delete().eq("student_id", studentId).eq("textbook_id", textbookId);
  }
  revalidatePath("/management/individualstdbooks");
  return {};
}
