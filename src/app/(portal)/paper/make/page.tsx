import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MakeClient } from "./MakeClient";

export default async function MakePage() {
  await requireUser();
  const supabase = await createClient();
  const { data: units } = await supabase
    .from("unit").select("code,subject,large_name,middle_name,ord").order("ord");
  return <MakeClient units={units ?? []} />;
}
