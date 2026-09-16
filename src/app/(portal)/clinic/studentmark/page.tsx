import { requireUser } from "@/lib/auth";
import { listStudentAssignments } from "../clinicActions";
import { StudentMarkClient } from "./StudentMarkClient";

export default async function Page() {
  await requireUser();
  // 첫 목록을 서버에서 함께 내려 보내 하이드레이션 후 추가 왕복 없이 바로 표시
  const initialRows = await listStudentAssignments({});
  return <StudentMarkClient initialRows={initialRows} />;
}
