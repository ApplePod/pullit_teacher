import { requireUser } from "@/lib/auth";
import { StatisticClient } from "./StatisticClient";

export default async function StatisticPage() {
  await requireUser();
  return <StatisticClient />;
}
