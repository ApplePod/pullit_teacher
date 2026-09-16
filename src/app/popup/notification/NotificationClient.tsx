"use client";

import { useEffect, useRef } from "react";
import { RawHtml } from "@/components/RawHtml";
import { closeLayerPopup } from "@/components/portal/LayerPopup";
import { NOTIFICATION_HTML } from "./notificationHtml";

/** 원본 알림 레이어(NotificationPart.cshtml) — 마크업 그대로, 닫기/탭 동작 연결 */
export function NotificationClient() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = host.current; if (!root) return;
    const modal = root.querySelector<HTMLElement>("#alramModal");
    if (modal) modal.style.display = "block";
    const onClick = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el.closest(".closeBtn") || el.closest("[data-bs-dismiss=alert]")) {
        if (el.closest(".closeBtn")) { closeLayerPopup(); return; }
        el.closest(".alert")?.remove(); return;
      }
      const tab = el.closest<HTMLElement>(".notification-wrap-popup-tabs button.today, .notification-wrap-popup-tabs button.all");
      if (tab) {
        root.querySelectorAll(".notification-wrap-popup-tabs button").forEach((b) => b.classList.remove("active"));
        tab.classList.add("active");
        const today = tab.classList.contains("today");
        root.querySelector("#notificationToday")?.classList.toggle("active", today);
        root.querySelector("#notificationAll")?.classList.toggle("active", !today);
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);
  return <div ref={host}><RawHtml html={NOTIFICATION_HTML} /></div>;
}
