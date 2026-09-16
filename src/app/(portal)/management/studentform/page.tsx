import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StudentFormClient } from "./StudentFormClient";
import type { StudentRow } from "../student/studentActions";

export default async function StudentFormPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireUser();
  const { id } = await searchParams;
  let student: StudentRow | null = null;
  if (id) {
    const supabase = await createClient();
    const { data } = await supabase.from("student").select("id,name,grade,phone,parent_name,parent_phone,state,study_level,entered_at,created_at,address,memo").eq("id", id).maybeSingle();
    student = (data as StudentRow | null) ?? null;
  }
  return <StudentFormClient student={student} />;
}
