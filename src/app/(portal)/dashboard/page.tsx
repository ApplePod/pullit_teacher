import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { profile, center } = await requireUser();
  return (
    <div>
      <h1 className="text-xl font-bold">대시보드</h1>
      <p className="mt-1 text-sm text-slate-500">
        {center.name} · {profile.name} {profile.role === "owner" ? "원장님" : "선생님"}, 안녕하세요.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["학생", "학원관리 › 학생에서 등록"],
          ["문제지", "문제지 › 만들기에서 생성"],
          ["채점", "클리닉에서 채점·리포트"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">{t}</div>
            <div className="mt-2 text-xs text-slate-400">{d}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-400">학생·문제지·채점 현황 위젯은 각 기능 구현(OPER-143~146) 후 연결됩니다.</p>
    </div>
  );
}
