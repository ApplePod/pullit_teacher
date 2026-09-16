"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BookRow { id: string; name: string; publisher: string | null; subject: string | null; class_count: number; student_count: number; created_at: string }

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, center_id: p.center_id } : null;
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
