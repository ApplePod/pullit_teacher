"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toEmail } from "@/lib/login-id";

export interface TeacherRow {
  id: string; name: string; email: string | null; phone: string | null;
  role: string; access_menu: Record<string, boolean>; created_at: string; login_id: string;
}

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profile").select("center_id,role").eq("id", user.id).maybeSingle();
  return profile ? { supabase, user, center_id: profile.center_id, role: profile.role } : null;
}

export async function listTeachers(): Promise<TeacherRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("profile")
    .select("id,name,email,phone,role,access_menu,created_at")
    .order("created_at");
  return (data ?? []).map((r) => ({
    ...r, access_menu: (r.access_menu ?? {}) as Record<string, boolean>,
    login_id: (r.email ?? "").split("@")[0],
  })) as TeacherRow[];
}

export async function createTeacher(input: {
  name: string; login_id: string; password: string; phone?: string; access_menu: Record<string, boolean>;
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (c.role !== "owner") return { error: "교사 등록은 원장만 가능합니다." };
  if (!input.name.trim() || !input.login_id.trim()) return { error: "교사명과 아이디를 입력해주세요." };
  if (input.password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };
  const email = toEmail(input.login_id);
  const admin = createAdminClient();
  const { data: created, error: ce } = await admin.auth.admin.createUser({
    email, password: input.password, email_confirm: true, user_metadata: { name: input.name },
  });
  if (ce || !created.user) return { error: ce?.message?.includes("already") ? "이미 사용 중인 아이디입니다." : "계정 생성에 실패했습니다." };
  const { error: pe } = await admin.from("profile").insert({
    id: created.user.id, center_id: c.center_id, role: "teacher", name: input.name.trim(),
    phone: input.phone || null, email, access_menu: input.access_menu,
  });
  if (pe) { await admin.auth.admin.deleteUser(created.user.id); return { error: "교사 정보 저장에 실패했습니다." }; }
  revalidatePath("/management/teacher");
  return {};
}

export async function deleteTeachers(ids: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (c.role !== "owner") return { error: "삭제는 원장만 가능합니다." };
  if (ids.includes(c.user.id)) return { error: "본인 계정은 삭제할 수 없습니다." };
  const admin = createAdminClient();
  for (const id of ids) {
    await admin.from("profile").delete().eq("id", id).eq("center_id", c.center_id);
    await admin.auth.admin.deleteUser(id);
  }
  revalidatePath("/management/teacher");
  return {};
}
