import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { CenterForm } from "./CenterForm";
import type { Center } from "@/lib/types";
export default async function CenterInfoPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data: center } = await supabase.from("center").select("*").eq("id", profile.center_id).maybeSingle<Center>();
  const readOnly = profile.role !== "owner";
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="manegment">
        <h3 className="section-title">교실 정보</h3>
        {readOnly && <p className="readonly-note">교실 정보 수정은 원장만 가능합니다.</p>}
        {center && <CenterForm center={center} readOnly={readOnly} />}
      </div>
    </div>
  );
}
