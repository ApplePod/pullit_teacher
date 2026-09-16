import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { MappingClient } from "./MappingClient";

export default async function MappingTextBooksPage() {
  await requireUser();
  return <Suspense fallback={<div className="contens-body" />}><MappingClient /></Suspense>;
}
