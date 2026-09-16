import { requireUser } from "@/lib/auth";
import { NotificationClient } from "./NotificationClient";
/** 원본 $m.openLayerPopup('/pages/center/shared/NotificationPart.cshtml') */
export default async function NotificationPopupPage() {
  await requireUser();
  return <NotificationClient />;
}
