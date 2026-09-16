"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export interface PaperRow { id: string; name: string; subject: string; paper_type: string; problem_count: number; created_at: string; is_favorite: boolean; is_shared: boolean; maker: string | null; unit_names: string[]; tags: string[]; grading: string }
export async function listPapers(opts: { search?: string; favorite?: boolean; shared?: boolean; trash?: boolean } = {}): Promise<PaperRow[]> {
  const supabase = await createClient();
  let q = supabase.from("paper").select("id,name,subject,paper_type,problem_count,created_at,is_favorite,is_shared,deleted_at,tags,options,maker:created_by(name),paper_problem(problem_code)").order("created_at", { ascending: false });
  q = opts.trash ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);
  if (opts.favorite) q = q.eq("is_favorite", true);
  if (opts.shared) q = q.eq("is_shared", true);
  if (opts.search?.trim()) q = q.ilike("name", `%${opts.search.trim()}%`);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Array<{ id: string; name: string; subject: string; paper_type: string; problem_count: number; created_at: string; is_favorite: boolean; is_shared: boolean; tags?: string[] | null; options?: Record<string, unknown> | null; maker?: { name?: string } | null; paper_problem?: { problem_code: string }[] }>;
  // 단원명(중단원) 태그: 문항 코드의 unit 부분으로 조회
  const codes = new Set<string>(); rows.forEach((r) => (r.paper_problem ?? []).forEach((p) => codes.add(p.problem_code.replace(/_\d+$/, ""))));
  const { data: units } = codes.size ? await supabase.from("unit").select("code,middle_name").in("code", [...codes]) : { data: [] };
  const umap = new Map((units ?? []).map((u) => [u.code, u.middle_name as string]));
  return rows.map((r) => ({
    id: r.id, name: r.name, subject: r.subject, paper_type: r.paper_type, problem_count: r.problem_count, created_at: r.created_at,
    is_favorite: r.is_favorite, is_shared: r.is_shared, maker: r.maker?.name ?? null,
    tags: r.tags ?? [], grading: r.options?.grading === "auto" ? "자동채점" : "직접채점",
    unit_names: [...new Set((r.paper_problem ?? []).map((p) => umap.get(p.problem_code.replace(/_\d+$/, "")) ?? "").filter(Boolean))].slice(0, 2),
  }));
}
export async function togglePaperFlag(ids: string[], field: "is_favorite" | "is_shared", value: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("paper").update({ [field]: value }).in("id", ids);
  if (error) return { error: "처리에 실패했습니다." };
  revalidatePath("/paper/mypaper"); revalidatePath("/paper/favorite"); revalidatePath("/paper/share");
  return {};
}
export async function trashPapers(ids: string[], restore = false): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("paper").update({ deleted_at: restore ? null : new Date().toISOString() }).in("id", ids);
  if (error) return { error: "처리에 실패했습니다." };
  revalidatePath("/paper/mypaper"); revalidatePath("/paper/trash");
  return {};
}
