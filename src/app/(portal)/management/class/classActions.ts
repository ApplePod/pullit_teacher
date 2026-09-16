"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ClassRow {
  id: string; name: string; grade: string | null; room: string | null; memo: string | null;
  teacher_id: string | null; teacher_name: string | null; student_count: number; created_at: string; reg_name: string | null;
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

export async function listClasses(): Promise<ClassRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("class_group")
    .select("id,name,grade,room,memo,teacher_id,created_at,teacher:teacher_id(name),class_student(count)")
    .eq("is_active", true).order("created_at", { ascending: false });
  return (data ?? []).map((r) => {
    const t = r as unknown as { teacher?: { name?: string } | null; class_student?: { count: number }[] };
    return {
      id: r.id, name: r.name, grade: r.grade, room: r.room, memo: r.memo, teacher_id: r.teacher_id,
      teacher_name: t.teacher?.name ?? null, student_count: t.class_student?.[0]?.count ?? 0,
      created_at: r.created_at, reg_name: t.teacher?.name ?? null,
    };
  }) as ClassRow[];
}

export async function createClassGroup(input: {
  name: string; teacher_id?: string; grade?: string; room?: string; memo?: string;
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "반 이름을 입력해주세요." };
  const { error } = await c.supabase.from("class_group").insert({
    center_id: c.center_id, name: input.name.trim(), teacher_id: input.teacher_id || null,
    grade: input.grade || null, room: input.room || null, memo: input.memo || null,
  });
  if (error) return { error: "반 등록에 실패했습니다." };
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
