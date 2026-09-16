import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { CenterForm } from "./CenterForm";
import type { CenterOptions } from "./actions";

export default async function CenterInfoPage() {
  const { user, profile, center } = await requireUser();
  const readOnly = profile.role !== "owner";
  // 교실홈 학습 정보 옵션 (center.options jsonb) — Center 타입에는 없어 별도 조회
  const supabase = await createClient();
  const { data: opt } = await supabase.from("center").select("options").eq("id", profile.center_id).maybeSingle();
  const options = (opt?.options ?? null) as Partial<CenterOptions> | null;
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="manegment">
        {readOnly && <p className="readonly-note">교실 정보 수정은 대표 선생님(원장)만 가능합니다.</p>}
        {center && (
          <CenterForm center={center} readOnly={readOnly} options={options}
            ownerName={profile.name} email={profile.email ?? user.email ?? ""} phone={profile.phone ?? ""} />
        )}
      </div>
    </div>
  );
}
