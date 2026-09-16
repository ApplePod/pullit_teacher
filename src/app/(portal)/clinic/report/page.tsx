import { requireUser } from "@/lib/auth";
import { ReportClient } from "./ReportClient";
export default async function Page() { await requireUser(); return <ReportClient />; }
