"use server";

import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/components/ProblemView";

/**
 * 쌍둥이 / 유사유형 문항 조회 (problem_link)
 *
 *  twin       같은 개념 + 같은 난이도 + 같은 인지단계(수학) / 같은 유형 + 같은 난이도(영어)
 *  similar    같은 개념(영어는 같은 유형), 난이도 무관
 *  step_up    같은 개념, 난이도 한 단계 위
 *  step_down  같은 개념, 난이도 한 단계 아래
 *
 * 링크는 scripts/build_problem_links.py 가 만들고, score(0~1) 내림차순이 곧 "가장 닮은 순서"다.
 */
export type LinkKind = "twin" | "similar" | "step_up" | "step_down";

/** actions.ts 의 searchProblems 와 동일한 컬럼 집합(= Problem 타입). 그쪽이 바뀌면 여기도 맞춘다. */
const PROBLEM_COLS =
  "problem_code,subject,unit_code,question,choices,answer_index,answer_text,answer_value,answer_type," +
  "difficulty,score,concept,concept_id,grade_band,grade_min,grade_max,semester";

const MAX_LIMIT = 50;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(Math.trunc(n), lo), hi);
}

/**
 * 한 문항의 연결 문항을 유사도 높은 순으로 돌려준다.
 * @param problemCode 기준 문항 코드
 * @param kind        관계 종류(기본 twin)
 * @param limit       최대 개수(기본 8, 최대 50)
 */
export async function listSimilarProblems(
  problemCode: string,
  kind: LinkKind = "twin",
  limit = 8,
): Promise<Problem[]> {
  const code = problemCode?.trim();
  if (!code) return [];
  const size = clamp(limit, 1, MAX_LIMIT);
  const supabase = await createClient();

  const { data: links, error } = await supabase
    .from("problem_link")
    .select("target_code,score")
    .eq("source_code", code)
    .eq("kind", kind)
    .order("score", { ascending: false })
    .limit(size);
  if (error || !links?.length) return [];

  const codes = links.map((l) => l.target_code as string);
  const { data: rows } = await supabase.from("problem").select(PROBLEM_COLS).in("problem_code", codes);
  if (!rows?.length) return [];

  // in() 은 순서를 보장하지 않으므로 유사도 순서로 다시 정렬한다.
  const byCode = new Map((rows as unknown as Problem[]).map((p) => [p.problem_code, p]));
  return codes.map((c) => byCode.get(c)).filter((p): p is Problem => Boolean(p));
}

/**
 * 오답 문항 목록을 받아 재시험(클리닉)용 대체 문항 코드를 고른다.
 * twin → similar → step_down 순으로 채우고, 입력 문항과 중복은 제외한다.
 * @param problemCodes 틀린 문항 코드들
 * @param count        필요한 대체 문항 수
 */
export async function pickRetestProblems(problemCodes: string[], count: number): Promise<string[]> {
  const sources = Array.from(new Set((problemCodes ?? []).map((c) => c?.trim()).filter(Boolean))) as string[];
  const want = clamp(count, 0, 200);
  if (!sources.length || want === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("problem_link")
    .select("source_code,target_code,kind,score")
    .in("source_code", sources)
    .in("kind", ["twin", "similar", "step_down"])
    .order("score", { ascending: false });
  if (error || !data?.length) return [];

  const rows = data as unknown as Array<{ source_code: string; target_code: string; kind: LinkKind; score: number }>;
  const excluded = new Set(sources);
  const picked: string[] = [];
  const seen = new Set<string>();

  // 같은 오답 문항에서만 몰아 뽑지 않도록, 오답별로 한 개씩 라운드로빈으로 채운다.
  for (const kind of ["twin", "similar", "step_down"] as const) {
    const queues = new Map<string, string[]>();
    for (const r of rows) {
      if (r.kind !== kind) continue;
      const q = queues.get(r.source_code) ?? [];
      q.push(r.target_code);
      queues.set(r.source_code, q);
    }
    let progressed = true;
    while (picked.length < want && progressed) {
      progressed = false;
      for (const src of sources) {
        if (picked.length >= want) break;
        const q = queues.get(src);
        if (!q?.length) continue;
        progressed = true;
        const next = q.shift() as string;
        if (excluded.has(next) || seen.has(next)) continue;
        seen.add(next);
        picked.push(next);
      }
    }
    if (picked.length >= want) break;
  }
  return picked.slice(0, want);
}
