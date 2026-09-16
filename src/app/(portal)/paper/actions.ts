"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/components/ProblemView";

export interface SearchFilter {
  subject: "math" | "english";
  unit_code?: string;
  difficulty?: string;
  page?: number;
}

export async function searchProblems(filter: SearchFilter): Promise<{ items: Problem[]; total: number }> {
  const supabase = await createClient();
  const page = filter.page ?? 1;
  const size = 20;
  let q = supabase
    .from("problem")
    .select("problem_code,subject,unit_code,question,choices,answer_index,answer_text,difficulty,score,concept", { count: "exact" })
    .eq("subject", filter.subject)
    .order("problem_code")
    .range((page - 1) * size, page * size - 1);
  if (filter.unit_code) q = q.eq("unit_code", filter.unit_code);
  if (filter.difficulty) q = q.eq("difficulty", filter.difficulty);
  const { data, count, error } = await q;
  if (error) return { items: [], total: 0 };
  return { items: (data ?? []) as Problem[], total: count ?? 0 };
}

export async function createPaper(input: {
  name: string;
  subject: "math" | "english";
  problem_codes: string[];
  /** 프린트 설정(만들기 3단계) — paper.options JSONB 에 그대로 저장 */
  options?: Record<string, unknown>;
  /** 임시 저장(draft) / 만들기 완료(ready) */
  status?: "draft" | "ready";
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const { data: profile } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  if (!profile) return { error: "학원 정보를 찾을 수 없습니다." };
  if (!input.name.trim()) return { error: "문제지 이름을 입력해주세요." };
  const status = input.status ?? "ready";
  if (status !== "draft" && input.problem_codes.length === 0) return { error: "문항을 1개 이상 선택해주세요." };

  const { data: paper, error: pe } = await supabase
    .from("paper")
    .insert({
      center_id: profile.center_id, created_by: user.id, name: input.name.trim(),
      subject: input.subject, status, problem_count: input.problem_codes.length,
      options: input.options ?? {},
    })
    .select("id").single();
  if (pe || !paper) return { error: "문제지 생성에 실패했습니다." };

  const rows = input.problem_codes.map((code, i) => ({
    paper_id: paper.id, center_id: profile.center_id, ord: i + 1, problem_code: code,
  }));
  const { error: ppe } = await supabase.from("paper_problem").insert(rows);
  if (ppe) {
    await supabase.from("paper").delete().eq("id", paper.id);
    return { error: "문항 저장에 실패했습니다." };
  }
  revalidatePath("/paper/mypaper");
  return { id: paper.id };
}
