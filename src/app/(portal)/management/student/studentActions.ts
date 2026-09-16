"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StudentRow {
  id: string; name: string; grade: string; phone: string | null;
  parent_name: string | null; parent_phone: string | null; state: string;
  study_level: string | null; entered_at: string | null; created_at: string;
}

const GRADE_LABEL: Record<string, string> = {
  h1: "고1", h2: "고2", h3: "고3", n: "N수", etc: "기타",
};
export async function gradeLabel(code: string) { return GRADE_LABEL[code] ?? code; }

export async function listStudents(search?: string): Promise<StudentRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("student")
    .select("id,name,grade,phone,parent_name,parent_phone,state,study_level,entered_at,created_at")
    .neq("state", "left")
    .order("created_at", { ascending: false });
  if (search?.trim()) q = q.ilike("name", `%${search.trim()}%`);
  const { data } = await q;
  return (data ?? []) as StudentRow[];
}

export async function createStudent(input: {
  name: string; grade: string; phone?: string;
  parent_name?: string; parent_phone?: string; address?: string; memo?: string;
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: profile } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  if (!profile) return { error: "학원 정보를 찾을 수 없습니다." };
  if (!input.name.trim()) return { error: "학생명을 입력해주세요." };
  const { data, error } = await supabase.from("student").insert({
    center_id: profile.center_id, name: input.name.trim(), grade: input.grade || "h3",
    phone: input.phone || null, parent_name: input.parent_name || null,
    parent_phone: input.parent_phone || null, address: input.address || null, memo: input.memo || null,
  }).select("id").single();
  if (error) return { error: "학생 등록에 실패했습니다." };
  revalidatePath("/management/student");
  return { id: data.id };
}

export async function updateStudent(id: string, input: Partial<{
  name: string; grade: string; phone: string; parent_name: string; parent_phone: string; address: string; memo: string;
}>): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("student").update(input).eq("id", id);
  if (error) return { error: "수정에 실패했습니다." };
  revalidatePath("/management/student");
  return {};
}

export async function deleteStudents(ids: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("student").update({ state: "left" }).in("id", ids);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/management/student");
  return {};
}
