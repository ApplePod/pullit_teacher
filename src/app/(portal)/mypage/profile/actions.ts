"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export type ActionState = { error?: string; message?: string } | null;

export async function saveProfile(input: { name: string; phone: string }): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!input.name.trim()) return { error: "이름을 입력해주세요." };
  const { error } = await supabase.from("profile").update({ name: input.name.trim(), phone: input.phone.trim() || null }).eq("id", user.id);
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/", "layout");
  return { message: "저장되었습니다." };
}

/** 폼 액션(useActionState) 경로 */
export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  return saveProfile({ name: String(fd.get("name") ?? ""), phone: String(fd.get("phone") ?? "") });
}

/** 원본 비밀번호 변경 1단계 — 현재 비밀번호 확인 (세션은 건드리지 않는 별도 클라이언트로 검증) */
export async function verifyCurrentPassword(password: string): Promise<ActionState> {
  if (!password) return { error: "현재 비밀번호를 입력해주세요." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "로그인이 필요합니다." };
  const { url, key } = supabaseEnv();
  const plain = createPlainClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await plain.auth.signInWithPassword({ email: user.email, password });
  if (error) return { error: "현재 비밀번호가 일치하지 않습니다." };
  return { message: "확인되었습니다." };
}

export async function setNewPassword(password: string, confirm: string): Promise<ActionState> {
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "비밀번호 변경에 실패했습니다." };
  return { message: "비밀번호가 변경되었습니다." };
}

/** 폼 액션(useActionState) 경로 */
export async function changePassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  return setNewPassword(String(fd.get("password") ?? ""), String(fd.get("confirm") ?? ""));
}
