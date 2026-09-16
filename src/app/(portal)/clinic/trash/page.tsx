import { requireUser } from "@/lib/auth";
import { TrashClient } from "./TrashClient";
export default async function Page() { await requireUser(); return <TrashClient />; }
