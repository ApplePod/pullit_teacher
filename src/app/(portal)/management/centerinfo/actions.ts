"use server";

import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/supabase/claims";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; message?: string } | null;

/** 원본 교실홈 학습 정보 옵션 (center.options jsonb) */
export interface CenterOptions {
  ox: string; sox: string; oxpub: string; 회차: string; ori: string; twin: string; s001: string; s002: string; ch_btn_visible: string;
}
export interface CenterInput {
  name: string; owner_name: string; tel: string; address: string; slogan: string;
  report_style: string; logo_url?: string | null; options?: CenterOptions;
}

/** 원본 교실설정 저장하기 — 우리 center 테이블이 가진 항목만 반영 */
export async function saveCenter(input: CenterInput): Promise<ActionState> {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: prof } = await supabase.from("profile").select("center_id,role").eq("id", user.id).maybeSingle();
  if (!prof) return { error: "교실 정보를 찾을 수 없습니다." };
  if (prof.role !== "owner") return { error: "교실 정보 수정은 대표 선생님만 가능합니다." };
  if (!input.name.trim()) return { error: "교실명을 입력해주세요." };

  const patch: Record<string, unknown> = {
    name: input.name.trim(),
    owner_name: input.owner_name.trim() || null,
    tel: input.tel.trim() || null,
    address: input.address.trim() || null,
    slogan: input.slogan.trim() || null,
    report_style: input.report_style || "v3",
  };
  if (input.logo_url !== undefined) patch.logo_url = input.logo_url;
  if (input.options) patch.options = input.options;

  const { error } = await supabase.from("center").update(patch).eq("id", prof.center_id);
  if (error) return { error: "저장에 실패했습니다." };
  revalidatePath("/", "layout");
  return { message: "저장되었습니다." };
}

/** 폼 액션(useActionState) 경로 — 원본 form submit 과 동일하게 동작 */
export async function updateCenter(_p: ActionState, fd: FormData): Promise<ActionState> {
  return saveCenter({
    name: String(fd.get("name") ?? ""),
    owner_name: String(fd.get("owner_name") ?? ""),
    tel: String(fd.get("tel") ?? ""),
    address: String(fd.get("address") ?? ""),
    slogan: String(fd.get("slogan") ?? ""),
    report_style: String(fd.get("report_style") ?? "v3"),
  });
}
