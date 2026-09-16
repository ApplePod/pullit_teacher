import { requireUser } from "@/lib/auth";
import { AttendanceClient } from "./AttendanceClient";
export default async function AttendancePage() { await requireUser(); return <AttendanceClient />; }
