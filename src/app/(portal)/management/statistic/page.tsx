import { requireUser } from "@/lib/auth";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { loadStats } from "./statActions";
export default async function StatisticPage() {
  await requireUser();
  const s = await loadStats();
  const cards: [string, string | number][] = [
    ["재원 학생", s.students], ["운영 반", s.classes], ["교사", s.teachers], ["문제지", s.papers],
    ["배정 건수", s.assignments], ["채점 완료", s.marked], ["채점 평균", s.avgScore != null ? `${s.avgScore}점` : "-"], ["이달 출결 기록", s.attendanceThisMonth],
  ];
  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <h3 className="section-title">학습현황</h3>
      <div className="stat-grid">
        {cards.map(([l, v]) => (
          <div key={l} className="stat-card"><div className="stat-card__label">{l}</div><div className="stat-card__value">{v}</div></div>
        ))}
      </div>
    </div>
  );
}
