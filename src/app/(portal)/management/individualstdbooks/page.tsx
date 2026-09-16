import { requireUser } from "@/lib/auth";
import { IBClient } from "./IBClient";
export default async function Page() { await requireUser(); return <IBClient />; }
