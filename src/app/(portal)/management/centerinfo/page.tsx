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
    <>
      {/* 원본 #contents 안의 구버전 헤더(스타일시트에서 display:none) — DOM 구조 그대로 유지 */}
      <div className="contents-header">
        <div className="contents-header__wrap">
          <div className="left-area">
            <span className="material-symbols-sharp">manage_accounts</span>
            <h2>관리</h2>
          </div>
          <div className="right-area">
            <button type="button" className="button__line button__fill--medium button__fill--red">
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>문제지 만들기</button>
          </div>
        </div>
      </div>
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
    </>
  );
}
