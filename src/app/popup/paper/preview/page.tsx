import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Problem } from "@/components/ProblemView";
import { PreviewPopupClient, PrintPopupClient, type PopupPaper } from "./PreviewPopupClient";

/** 원본 $meta3.doPreviewPaper(POST /pages/bank/previewpaper) · doPrintPaper(/pages/bank/printpaper?f_paper_list=) */
export default async function PreviewPopupPage({ searchParams }: { searchParams: Promise<{ ids?: string; print?: string }> }) {
  const { center } = await requireUser();
  const { ids = "", print } = await searchParams;
  const list = ids.split(",").filter(Boolean);
  const supabase = await createClient();
  const { data: papers } = await supabase.from("paper").select("id,name").in("id", list.length ? list : ["00000000-0000-0000-0000-000000000000"]);
  const { data: pp } = await supabase.from("paper_problem").select("paper_id,ord,problem_code").in("paper_id", list.length ? list : ["00000000-0000-0000-0000-000000000000"]).order("ord");
  const codes = [...new Set((pp ?? []).map((r) => r.problem_code))];
  const { data: problems } = await supabase.from("problem").select("problem_code,subject,unit_code,question,choices,answer_index,answer_text,difficulty,score,concept,explanation").in("problem_code", codes.length ? codes : ["__none__"]);
  const pmap = new Map((problems ?? []).map((p) => [p.problem_code, p as Problem]));
  const out: PopupPaper[] = list.map((id) => {
    const paper = (papers ?? []).find((p) => p.id === id); if (!paper) return null;
    const probs = (pp ?? []).filter((r) => r.paper_id === id).map((r) => pmap.get(r.problem_code)).filter(Boolean) as Problem[];
    return { meta: { title: paper.name, studyName: "교과학습", paperId: String(id).slice(0, 8), logoUrl: center?.logo_url ?? null }, problems: probs };
  }).filter(Boolean) as PopupPaper[];
  return print ? <PrintPopupClient papers={out} /> : <PreviewPopupClient papers={out} />;
}
