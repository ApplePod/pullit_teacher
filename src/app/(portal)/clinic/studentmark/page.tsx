import { requireUser } from "@/lib/auth";
import { StudentMarkClient } from "./StudentMarkClient";
export default async function Page() { await requireUser(); return <StudentMarkClient />; }
