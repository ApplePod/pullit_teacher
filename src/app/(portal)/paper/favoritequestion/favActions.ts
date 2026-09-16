"use server";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/supabase/claims";
import { createClient } from "@/lib/supabase/server";

export interface FavFolder { id: string; name: string; count: number; updated_at: string; owner: string | null }

async function ctx() {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id,name").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id as string, name: p.name as string } : null;
}

export async function listFavFolders(search = ""): Promise<FavFolder[]> {
  const c = await ctx(); if (!c) return [];
  let q = c.supabase.from("favorite_folder").select("id,name,updated_at,user_id,profile:user_id(name)").order("updated_at", { ascending: false });
  if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Array<{ id: string; name: string; updated_at: string; profile?: { name?: string } | null }>;
  const { data: items } = await c.supabase.from("favorite_problem").select("folder_id");
  const cnt = new Map<string, number>();
  (items ?? []).forEach((i) => { if (i.folder_id) cnt.set(i.folder_id, (cnt.get(i.folder_id) ?? 0) + 1); });
  return rows.map((r) => ({ id: r.id, name: r.name, updated_at: r.updated_at, owner: r.profile?.name ?? null, count: cnt.get(r.id) ?? 0 }));
}

export async function createFavFolder(name: string): Promise<{ error?: string; id?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!name.trim()) return { error: "폴더명을 입력해 주세요." };
  const { data, error } = await c.supabase.from("favorite_folder")
    .insert({ center_id: c.center_id, user_id: c.user.id, name: name.trim() }).select("id").single();
  if (error) return { error: "등록에 실패했습니다." };
  revalidatePath("/paper/favoritequestion");
  return { id: data.id };
}

export async function renameFavFolder(id: string, name: string): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!name.trim()) return { error: "폴더명을 입력해 주세요." };
  const { error } = await c.supabase.from("favorite_folder").update({ name: name.trim(), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: "수정에 실패했습니다." };
  revalidatePath("/paper/favoritequestion");
  return {};
}

export async function deleteFavFolders(ids: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const { error } = await c.supabase.from("favorite_folder").delete().in("id", ids);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/paper/favoritequestion");
  return {};
}

/** 폴더에 담긴 문항 코드 */
export async function listFavItems(folder_id: string): Promise<string[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("favorite_problem").select("problem_code").eq("folder_id", folder_id);
  return (data ?? []).map((r) => r.problem_code as string);
}

export async function setFavItems(folder_id: string, codes: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  await c.supabase.from("favorite_problem").delete().eq("folder_id", folder_id);
  if (codes.length) {
    const rows = codes.map((code) => ({ center_id: c.center_id, user_id: c.user.id, problem_code: code, folder_id }));
    const { error } = await c.supabase.from("favorite_problem").insert(rows);
    if (error) return { error: "저장에 실패했습니다." };
  }
  await c.supabase.from("favorite_folder").update({ updated_at: new Date().toISOString() }).eq("id", folder_id);
  revalidatePath("/paper/favoritequestion");
  return {};
}
