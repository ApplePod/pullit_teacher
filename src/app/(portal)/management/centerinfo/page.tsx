import { requireUser } from "@/lib/auth";
import { CenterForm } from "./CenterForm";

export default async function CenterInfoPage() {
  const { profile, center } = await requireUser();
  const readOnly = profile.role !== "owner";
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold">학원 정보</h1>
      <p className="mt-1 text-sm text-slate-500">
        {readOnly ? "학원 정보 수정은 원장 계정만 가능합니다." : "문제지·리포트 상단에 표시되는 학원 정보입니다."}
      </p>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <CenterForm center={center} readOnly={readOnly} />
      </section>
    </div>
  );
}
