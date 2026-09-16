import { requireUser } from "@/lib/auth";
import { TeacherClient } from "./TeacherClient";
export default async function TeacherPage() { await requireUser(); return <TeacherClient />; }
