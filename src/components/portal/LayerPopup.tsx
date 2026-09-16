"use client";

import { useEffect, useState } from "react";

/**
 * 원본 $m.openLayerPopup 그대로: <div kind="iframe_layer" style="position:fixed;inset:0;z-index:1055;background:rgba(0,0,0,.1);display:flex;…"><iframe …></div>
 * 자식(iframe)이 postMessage({ptClosePopup:true}) 를 보내면 닫힘 (원본 $m.closePopup 대응).
 */
export function useLayerPopup() {
  const [link, setLink] = useState<string | null>(null);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => { if (e.data?.ptClosePopup) setLink(null); };
    window.addEventListener("message", onMsg); return () => window.removeEventListener("message", onMsg);
  }, []);
  useEffect(() => { document.body.style.overflow = link ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [link]);
  const popup = link ? (
    <div id="layer_popup" {...({ kind: "iframe_layer" } as Record<string, string>)}
      style={{ position: "fixed", left: 0, top: 0, width: "100%", height: "100%", zIndex: 1055, backgroundColor: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <iframe src={link} title="popup" frameBorder={0} allowTransparency style={{ position: "fixed", width: "100%", height: "100%", border: "none", background: "#fff" }} />
    </div>
  ) : null;
  return { open: (l: string) => setLink(l), close: () => setLink(null), popup };
}

/** 팝업 안(iframe)에서 원본 $m.closePopup() 과 동일하게 닫기 */
export function closeLayerPopup() {
  if (typeof window === "undefined") return;
  if (window.parent && window.parent !== window) window.parent.postMessage({ ptClosePopup: true }, "*");
  else window.history.back();
}
