"use client";

import { useEffect, useRef, useState } from "react";
import { RawHtml } from "@/components/RawHtml";
import { TUTORIAL_BTN_HTML, TUTORIAL_MODAL_HTML, ONBOARDING_MODAL_HTML } from "./tutorialHtml";

/**
 * 원본 #wrap 안 맨 위의 튜토리얼 영역(.tutorial-btn-wrap)과 두 모달(#modal-tutorial, #onboarding).
 * 마크업은 원본 그대로이고, 부트스트랩 대신 여기서 열고 닫는다.
 */
export function TutorialArea() {
  const host = useRef<HTMLDivElement>(null);
  const modalHost = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<null | "tutorial" | "onboarding">(null);
  useEffect(() => {
    const root = host.current; if (!root) return;
    const onClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest("button"); if (!btn) return;
      const target = btn.getAttribute("data-bs-target");
      if (target === "#modal-tutorial") setOpen("tutorial");
      else if (target === "#onboarding") setOpen("onboarding");
      else if (btn.id === "btn-tutorial") setOpen("tutorial");
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onClose = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest(".btn-close, [data-bs-dismiss=modal]") || t.classList.contains("modal")) setOpen(null);
    };
    document.addEventListener("click", onClose);
    return () => document.removeEventListener("click", onClose);
  }, [open]);
  return (
    <>
      {/* 원본 DOM: #wrap > .tutorial-btn-wrap (감싸는 div 없음) */}
      <RawHtml html={TUTORIAL_BTN_HTML} ref={host} />
      {open === "tutorial" && <><RawHtml html={TUTORIAL_MODAL_HTML} className="show" style={{ display: "block" }} ref={modalHost} /><div className="modal-backdrop fade show" /></>}
      {open === "onboarding" && <><RawHtml html={ONBOARDING_MODAL_HTML} className="show" style={{ display: "block" }} ref={modalHost} /><div className="modal-backdrop fade show" /></>}
    </>
  );
}
