import { requireUser } from "@/lib/auth";
import { fmtMonth } from "@/lib/date";
import { loadMonth, listClassOptions } from "./attendanceActions";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  await requireUser();
  const ym = fmtMonth();
  // 이번 달 출결과 반 목록을 서버에서 함께 조회해 첫 화면에 바로 표시
  const [initial, classes] = await Promise.all([loadMonth(ym), listClassOptions()]);
  return <AttendanceClient initialMonth={ym} initialData={initial} initialClasses={classes} />;
}
