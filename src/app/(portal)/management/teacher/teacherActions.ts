"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toEmail, displayLoginId } from "@/lib/login-id";

export interface TeacherRow {
  id: string; name: string; email: string | null; phone: string | null;
  role: string; access_menu: Record<string, boolean>; created_at: string; login_id: string;
}

/** 원본 teacher.cshtml 상세화면의 메뉴별 사용권한 목록(arrForRenderList) 그대로 */
export interface TeacherDetail {
  id: string; name: string; phone: string; login_id: string; contact_email: string;
  access_menu: Record<string, boolean>; role: string; updated_name: string; updated_at: string;
}

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profile").select("center_id,role,name").eq("id", user.id).maybeSingle();
  return profile ? { supabase, user, center_id: profile.center_id, role: profile.role, name: profile.name } : null;
}

export async function listTeachers(opts?: { key?: string; keyword?: string; perm?: string }): Promise<TeacherRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("profile")
    .select("id,name,email,phone,role,access_menu,created_at")
    .order("created_at");
  let rows = (data ?? []).map((r) => ({
    ...r, access_menu: (r.access_menu ?? {}) as Record<string, boolean>,
    login_id: displayLoginId(r.email ?? undefined),
  })) as TeacherRow[];
  const kw = (opts?.keyword ?? "").trim().toLowerCase();
  if (kw) {
    rows = rows.filter((r) => (opts?.key === "f_web_id" ? r.login_id : r.name).toLowerCase().includes(kw));
  }
  if (opts?.perm) rows = rows.filter((r) => r.role === "owner" || r.access_menu[opts.perm as string] === true);
  return rows;
}

export async function getTeacher(id: string): Promise<TeacherDetail | null> {
  const c = await ctx(); if (!c) return null;
  const { data } = await c.supabase.from("profile")
    .select("id,name,email,contact_email,phone,role,access_menu,updated_at").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, name: data.name ?? "", phone: data.phone ?? "",
    login_id: displayLoginId(data.email ?? undefined), contact_email: data.contact_email ?? "",
    access_menu: (data.access_menu ?? {}) as Record<string, boolean>, role: data.role,
    updated_name: c.name ?? "", updated_at: (data.updated_at ?? "").toString().slice(0, 16).replace("T", " "),
  };
}

/** 원본 doCheckDupWebID — 아이디 중복 확인 */
export async function checkDupLoginId(loginId: string): Promise<{ dup: boolean }> {
  const c = await ctx(); if (!c) return { dup: true };
  const { data } = await c.supabase.from("profile").select("id").eq("email", toEmail(loginId)).maybeSingle();
  return { dup: !!data };
}

export async function createTeacher(input: {
  name: string; login_id: string; password: string; phone?: string; contact_email?: string;
  access_menu: Record<string, boolean>;
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (c.role !== "owner") return { error: "교사 등록은 원장만 가능합니다." };
  if (!input.name.trim() || !input.login_id.trim()) return { error: "교사명과 아이디를 입력해주세요." };
  if (input.password.length < 4) return { error: "비밀번호는 영문,숫자 4~12자리여야합니다." };
  const email = toEmail(input.login_id);
  const admin = createAdminClient();
  const { data: created, error: ce } = await admin.auth.admin.createUser({
    email, password: input.password, email_confirm: true, user_metadata: { name: input.name },
  });
  if (ce || !created.user) return { error: ce?.message?.includes("already") ? "이미 존재하는 아이디입니다." : "계정 생성에 실패했습니다." };
  const { error: pe } = await admin.from("profile").insert({
    id: created.user.id, center_id: c.center_id, role: "teacher", name: input.name.trim(),
    phone: input.phone || null, email, contact_email: input.contact_email || null, access_menu: input.access_menu,
  });
  if (pe) { await admin.auth.admin.deleteUser(created.user.id); return { error: "교사 정보 저장에 실패했습니다." }; }
  revalidatePath("/management/teacher");
  return {};
}

export async function updateTeacher(id: string, input: {
  name: string; login_id: string; password?: string; phone?: string; contact_email?: string;
  access_menu: Record<string, boolean>;
}): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (c.role !== "owner" && c.user.id !== id) return { error: "수정은 원장만 가능합니다." };
  if (!input.name.trim() || !input.login_id.trim()) return { error: "교사명과 아이디를 입력해주세요." };
  const admin = createAdminClient();
  const email = toEmail(input.login_id);
  const upd: { email: string; password?: string; user_metadata: Record<string, string> } = {
    email, user_metadata: { name: input.name.trim() },
  };
  if (input.password) upd.password = input.password;
  const { error: ue } = await admin.auth.admin.updateUserById(id, upd);
  if (ue) return { error: ue.message.includes("already") ? "이미 존재하는 아이디입니다." : "계정 수정에 실패했습니다." };
  const { error } = await admin.from("profile").update({
    name: input.name.trim(), phone: input.phone || null, email,
    contact_email: input.contact_email || null, access_menu: input.access_menu,
  }).eq("id", id).eq("center_id", c.center_id);
  if (error) return { error: "교사 정보 저장에 실패했습니다." };
  revalidatePath("/management/teacher");
  return {};
}

/** 원본 "일괄 사용권한 변경"(changeteacherability.cshtml) 대체 — 선택 교사에게 메뉴권한 일괄 적용 */
export async function bulkUpdateTeacherPerms(ids: string[], access_menu: Record<string, boolean>): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (c.role !== "owner") return { error: "사용권한 변경은 원장만 가능합니다." };
  const admin = createAdminClient();
  const { error } = await admin.from("profile").update({ access_menu }).in("id", ids).eq("center_id", c.center_id);
  if (error) return { error: "사용권한 변경에 실패했습니다." };
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
