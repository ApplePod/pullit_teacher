"use client";

import { useEffect, useState } from "react";

/**
 * 원본 $m.openLayerPopup 그대로: <div kind="iframe_layer" style="position:fixed;inset:0;z-index:1055;background:rgba(0,0,0,.1);display:flex;…"><iframe …></div>
 * 자식(iframe)이 postMessage({ptClosePopup:true}) 를 보내면 닫힘 (원본 $m.closePopup 대응).
 */
export function useLayerPopup(opts: { global?: boolean } = {}) {
  const [links, setLinks] = useState<string[]>([]);
  const isGlobal = !!opts.global;
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.ptClosePopup) setLinks((l) => l.slice(0, -1));
      // 팝업 안에서 또 다른 레이어 팝업을 열 때(원본 $m.openLayerPopup 중첩) — 전역(TopNav) 인스턴스만 처리
      if (isGlobal && typeof e.data?.ptOpenLayer === "string") setLinks((l) => [...l, e.data.ptOpenLayer]);
    };
    window.addEventListener("message", onMsg); return () => window.removeEventListener("message", onMsg);
  }, [isGlobal]);
  const open = !!links.length;
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const popup = links.length ? links.map((link, i) => (
    <div key={i} id={i === 0 ? "layer_popup" : `layer_popup_${i}`} {...({ kind: "iframe_layer" } as Record<string, string>)}
      style={{ position: "fixed", left: 0, top: 0, width: "100%", height: "100%", zIndex: 1055 + i, backgroundColor: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <iframe src={link} title="popup" frameBorder={0} allowTransparency style={{ position: "fixed", width: "100%", height: "100%", border: "none", background: "#fff" }} />
    </div>
  )) : null;
  return { open: (l: string) => setLinks((x) => [...x, l]), close: () => setLinks([]), popup };
}

/** 팝업 안(iframe)에서 원본처럼 또 다른 레이어 팝업 열기 */
export function openLayerPopupFromChild(url: string) {
  if (typeof window === "undefined") return;
  if (window.parent && window.parent !== window) window.parent.postMessage({ ptOpenLayer: url }, "*");
  else window.location.href = url;
}

/** 팝업 안(iframe)에서 원본 $m.closePopup() 과 동일하게 닫기 */
export function closeLayerPopup() {
  if (typeof window === "undefined") return;
  if (window.parent && window.parent !== window) window.parent.postMessage({ ptClosePopup: true }, "*");
  else window.history.back();
}
