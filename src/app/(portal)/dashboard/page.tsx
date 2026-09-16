import { requireUser } from "@/lib/auth";
import { ContentsHeader } from "@/components/portal/ContentsHeader";

export default async function DashboardPage() {
  const { profile, center } = await requireUser();
  return (
    <>
      <ContentsHeader icon="dashboard" title={center.name} userName={profile.name} />
      <div className="contens-body">
        <div className="alert alert-blue fade show mt-40 p-3 justify-content-between" role="alert">
          <div className="d-flex gap-1">
            <span className="material-symbols-sharp">error</span>
            <div className="msg">{profile.name} {profile.role === "owner" ? "원장님" : "선생님"}, 안녕하세요. 학생·문제지·채점 현황 위젯은 각 기능 구현 후 이 자리에 표시됩니다.</div>
          </div>
        </div>
        <div className="contents-body-dashboard mt-24" />
      </div>
    </>
  );
}
