import { requireUser } from "@/lib/auth";
import { ClassClient } from "./ClassClient";
export default async function ClassPage() { await requireUser(); return <ClassClient />; }
