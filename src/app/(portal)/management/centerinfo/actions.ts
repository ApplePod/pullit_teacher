"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/(auth)/actions";

export async function updateCenter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return { error: "학원명을 입력해주세요." };

  const payload = {
    name,
    owner_name: String(formData.get("owner_name") ?? "").trim() || null,
    tel: String(formData.get("tel") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    slogan: String(formData.get("slogan") ?? "").trim() || null,
  };

  const supabase = await createClient();
  const { error, count } = await supabase.from("center").update(payload, { count: "exact" }).eq("id", id);
  if (error) return { error: "저장에 실패했습니다." };
  if (count === 0) return { error: "학원 정보는 원장만 수정할 수 있습니다." };
  revalidatePath("/", "layout");
  return { message: "저장되었습니다." };
}
