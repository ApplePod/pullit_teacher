import { requireUser } from "@/lib/auth";
import { FavQuestionClient } from "./FavQuestionClient";
export default async function Page() { await requireUser(); return <FavQuestionClient />; }
