import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile, center } = await requireUser();
  return (
    <div className="contens-body">
      <div className="alert alert-blue fade show p-3 justify-content-between" role="alert">
        <div className="d-flex gap-1">
          <span className="material-symbols-sharp">error</span>
          <div className="msg">{center.name} · {profile.name} {profile.role === "owner" ? "원장님" : "선생님"}, 안녕하세요. 학생·문제지·채점 현황 위젯은 각 기능 구현 후 이 자리에 표시됩니다.</div>
        </div>
      </div>
      <div className="contents-body-dashboard mt-24">
        <div className="dashboard__status">
          <div className="dashboard__status--body">
            {[["문제지 채점 현황", "clipboard-list-check"], ["교재 매칭 채점", "clipboard-list-check"]].map(([t, ic]) => (
              <div key={t} className="dashboard__status--card">
                <div className="card-body">
                  <div className="card-title">
                    <div className="icon"><i className={`fa-sharp fa-regular fa-${ic}`} aria-hidden="true"></i></div>
                    <h6 className="title">{t} <span className="badge-alram">0</span></h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
