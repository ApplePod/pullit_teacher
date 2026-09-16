import { requireUser } from "@/lib/auth";
import { PaperListClient } from "./PaperListClient";
export default async function MyPaperPage() { await requireUser(); return <PaperListClient mode="mine" />; }
