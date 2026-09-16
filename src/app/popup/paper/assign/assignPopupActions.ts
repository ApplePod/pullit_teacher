"use server";
import { createClient } from "@/lib/supabase/server";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
export interface AsgStudent { id: string; name: string; level: string; grade: string; state: string; group_id: string | null; group_name: string | null }
/** 배정 팝업용 학생·반 목록 (정규/예비 상태 포함) */
export async function listStudentsForAssign(): Promise<{ students: AsgStudent[]; groups: { id: string; name: string }[] }> {
  const supabase = await createClient();
  const { data: st } = await supabase.from("student").select("id,name,grade,state,study_level").neq("state", "left").order("name");
  const { data: cs } = await supabase.from("class_student").select("class_id,student_id");
  const { data: cg } = await supabase.from("class_group").select("id,name").order("name");
  const gname = new Map((cg ?? []).map((g) => [g.id, g.name as string]));
  const gOf = new Map((cs ?? []).map((r) => [r.student_id, r.class_id]));
  const students = (st ?? []).map((s) => ({
    id: s.id, name: s.name, level: (s.study_level as string) ?? "", grade: GRADE_LABEL[s.grade as string] ?? (s.grade as string) ?? "",
    state: s.state as string, group_id: gOf.get(s.id) ?? null, group_name: gname.get(gOf.get(s.id) ?? "") ?? null,
  }));
  return { students, groups: (cg ?? []).map((g) => ({ id: g.id, name: g.name as string })) };
}
