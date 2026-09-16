import { requireUser } from "@/lib/auth";
import { ContentsHeader } from "@/components/portal/ContentsHeader";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { CenterForm } from "./CenterForm";

export default async function CenterInfoPage() {
  const { profile, center } = await requireUser();
  const readOnly = profile.role !== "owner";
  return (
    <>
      <ContentsHeader icon="manage_accounts" title="관리" userName={profile.name} />
      <div className="contens-body">
        <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
        <div className="manegment">
          <h3 className="section-title">학원 정보</h3>
          {readOnly && <p className="readonly-note">학원 정보 수정은 원장 계정만 가능합니다.</p>}
          <CenterForm center={center} readOnly={readOnly} />
        </div>
      </div>
    </>
  );
}
