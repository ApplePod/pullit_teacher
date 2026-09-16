"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type ActionState = { error?: string; message?: string } | null;
export async function updateCenter(_p: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: prof } = await supabase.from("profile").select("center_id,role").eq("id", user.id).maybeSingle();
  if (!prof) return { error: "학원 정보를 찾을 수 없습니다." };
  if (prof.role !== "owner") return { error: "학원 정보 수정은 원장만 가능합니다." };
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "학원명을 입력해주세요." };
  const { error } = await supabase.from("center").update({
    name, owner_name: String(fd.get("owner_name") ?? "").trim() || null,
    tel: String(fd.get("tel") ?? "").trim() || null, address: String(fd.get("address") ?? "").trim() || null,
    slogan: String(fd.get("slogan") ?? "").trim() || null,
  }).eq("id", prof.center_id);
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/", "layout");
  return { message: "저장되었습니다." };
}
