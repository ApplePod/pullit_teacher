import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PaperPreview } from "./PaperPreview";
import type { Problem } from "@/components/ProblemView";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const supabase = await createClient();
  const { data: paper } = await supabase.from("paper").select("id,name,subject,problem_count").eq("id", id).maybeSingle();
  if (!paper) notFound();
  const { data: pp } = await supabase.from("paper_problem").select("ord,problem_code").eq("paper_id", id).order("ord");
  const codes = (pp ?? []).map((r) => r.problem_code);
  const { data: problems } = await supabase
    .from("problem")
    .select("problem_code,subject,unit_code,question,choices,answer_index,answer_text,difficulty,score,concept")
    .in("problem_code", codes.length ? codes : ["__none__"]);
  const map = new Map((problems ?? []).map((p) => [p.problem_code, p as Problem]));
  const ordered = codes.map((c) => map.get(c)).filter(Boolean) as Problem[];
  return (
    <div className="contens-body">
      <div className="d-flex justify-content-between items-center mb-16">
        <h3 className="section-title" style={{ margin: 0 }}>{paper.name}</h3>
        <Link href="/paper/mypaper" className="btn btn-default">목록으로</Link>
      </div>
      <PaperPreview title={paper.name} problems={ordered} />
    </div>
  );
}
