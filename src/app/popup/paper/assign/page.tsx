import { requireUser } from "@/lib/auth";
import { AssignPopupClient } from "./AssignPopupClient";
/** 원본 $m.openLayerPopup('/Pages/Center/Popup/Assignment.cshtml?pids=…') */
export default async function AssignPopupPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  await requireUser();
  const { ids = "" } = await searchParams;
  return <AssignPopupClient paperIds={ids.split(",").filter(Boolean)} />;
}
