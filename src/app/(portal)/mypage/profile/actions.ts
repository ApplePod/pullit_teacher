"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type ActionState = { error?: string; message?: string } | null;
export async function updateProfile(_p: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "이름을 입력해주세요." };
  const { error } = await supabase.from("profile").update({ name, phone: String(fd.get("phone") ?? "").trim() || null }).eq("id", user.id);
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/", "layout");
  return { message: "저장되었습니다." };
}
export async function changePassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  const password = String(fd.get("password") ?? ""); const confirm = String(fd.get("confirm") ?? "");
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "비밀번호 변경에 실패했습니다." };
  return { message: "비밀번호가 변경되었습니다." };
}
