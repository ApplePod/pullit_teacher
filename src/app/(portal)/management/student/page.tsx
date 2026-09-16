import { requireUser } from "@/lib/auth";
import { StudentClient } from "./StudentClient";

export default async function StudentPage() {
  await requireUser();
  return <StudentClient />;
}
