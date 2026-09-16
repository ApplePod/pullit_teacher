import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ListTab } from "@/components/portal/ListTab";
import { PAPER_TABS } from "@/lib/nav";

const SUBJECT: Record<string, string> = { math: "수학", english: "영어" };

export default async function MyPaperPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: papers } = await supabase
    .from("paper")
    .select("id,name,subject,problem_count,status,created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (
    <div className="contens-body">
      <ListTab tabs={PAPER_TABS} className="mb-24" />
      <div className="d-flex justify-content-between items-center mb-16">
        <h3 className="section-title" style={{ margin: 0 }}>내 문제지</h3>
        <Link href="/paper/make" className="button__line button__fill--medium button__fill--red">
          <i className="fa-solid fa-pencil" aria-hidden="true"></i> 문제지 만들기
        </Link>
      </div>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead>
            <tr>
              <th className="text-left">문제지명</th>
              <th style={{ width: 90 }}>과목</th>
              <th style={{ width: 90 }}>문항수</th>
              <th style={{ width: 140 }}>생성일</th>
            </tr>
          </thead>
          <tbody>
            {(papers ?? []).map((p) => (
              <tr key={p.id}>
                <td className="text-left"><Link href={`/paper/${p.id}`}>{p.name}</Link></td>
                <td>{SUBJECT[p.subject] ?? p.subject}</td>
                <td>{p.problem_count}</td>
                <td>{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
            {(papers ?? []).length === 0 && (
              <tr><td colSpan={4} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>등록된 문제지가 없습니다. ‘문제지 만들기’로 첫 문제지를 만들어보세요.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
