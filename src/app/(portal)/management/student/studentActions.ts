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
  parent_name?: string; parent_phone?: string; address?: string; memo?: string; study_level?: string; state?: string;
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
    study_level: input.study_level || null, state: input.state || "active",
  }).select("id").single();
  if (error) return { error: "학생 등록에 실패했습니다." };
  revalidatePath("/management/student");
  return { id: data.id };
}

export async function updateStudent(id: string, input: Partial<{
  name: string; grade: string; phone: string; parent_name: string; parent_phone: string; address: string; memo: string; study_level: string; state: string;
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

export async function bulkUpdateStudents(ids: string[], patch: { study_level?: string; state?: string }): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (ids.length === 0) return { error: "학생을 선택해주세요." };
  const upd: Record<string, string> = {};
  if (patch.study_level) upd.study_level = patch.study_level;
  if (patch.state) upd.state = patch.state;
  if (Object.keys(upd).length === 0) return { error: "변경할 값을 선택해주세요." };
  const { error } = await supabase.from("student").update(upd).in("id", ids);
  if (error) return { error: "일괄 변경에 실패했습니다." };
  revalidatePath("/management/student");
  return { count: ids.length };
}

export async function bulkCreateStudents(text: string): Promise<{ error?: string; created?: number; failed?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: profile } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  if (!profile) return { error: "학원 정보를 찾을 수 없습니다." };
  // 탭/콤마 구분: 학생명[, 학년, 휴대폰, 보호자명, 보호자휴대폰]
  const GMAP: Record<string, string> = { "고1": "h1", "고2": "h2", "고3": "h3", "N수": "n", "n수": "n", "기타": "etc" };
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\t|,/).map((c) => c.trim()));
  const payload = rows.filter((c) => c[0]).map((c) => ({
    center_id: profile.center_id, name: c[0], grade: GMAP[c[1]] ?? "h3",
    phone: c[2] || null, parent_name: c[3] || null, parent_phone: c[4] || null,
  }));
  if (payload.length === 0) return { error: "붙여넣은 데이터가 없습니다." };
  const { data, error } = await supabase.from("student").insert(payload).select("id");
  if (error) return { error: "대량 등록에 실패했습니다. 형식을 확인해주세요." };
  revalidatePath("/management/student");
  return { created: (data ?? []).length, failed: payload.length - (data ?? []).length };
}
