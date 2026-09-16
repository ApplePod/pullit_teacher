import { requireUser } from "@/lib/auth";
import { PaperListClient } from "../mypaper/PaperListClient";
export default async function Page() { await requireUser(); return <PaperListClient mode="trash" />; }
