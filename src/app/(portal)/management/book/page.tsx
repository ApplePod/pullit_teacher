import { requireUser } from "@/lib/auth";
import { BookClient } from "./BookClient";
export default async function BookPage() { await requireUser(); return <BookClient />; }
