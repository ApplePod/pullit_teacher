import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MakeClient } from "@/app/(portal)/paper/make/MakeClient";

/** 원본처럼 '문제지 만들기'는 레이어 팝업(iframe) 안에서 전체 화면으로 열림 */
export default async function MakePopupPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: units } = await supabase.from("unit").select("code,subject,large_name,middle_name,ord").order("ord");
  return <MakeClient units={units ?? []} popup />;
}
