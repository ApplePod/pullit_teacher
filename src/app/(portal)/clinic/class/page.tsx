import { requireUser } from "@/lib/auth";
import { ClassMarkClient } from "./ClassMarkClient";
export default async function Page() { await requireUser(); return <ClassMarkClient />; }
