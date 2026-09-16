"use client";

import { useEffect, useState } from "react";

/**
 * 원본 $m.alert / $m.confirm 그대로 (function.modal.js $m.modal):
 * .modal.fade.modal--xsmall.max-400.show > .modal-dialog.modal-dialog-centered > .modal-content >
 *   .modal-header > h5.modal-title(알림|확인) / .modal-body.text-center.pl-40.pr-40 > p.fw-600 / .modal-footer > button.cancel(취소) button.submit(확인)
 * 어디서든 metaAlert(msg) / await metaConfirm(msg) 로 호출 — <MetaModalHost/> 가 한 번 마운트되어 있어야 함.
 */
type Req = { kind: "alert" | "confirm"; title: string; message: string; resolve: (v: boolean) => void };
let pushReq: ((r: Req) => void) | null = null;

export function metaAlert(message: string, title = "알림"): Promise<boolean> {
  return new Promise((resolve) => { if (pushReq) pushReq({ kind: "alert", title, message, resolve }); else { window.alert(message); resolve(true); } });
}
export function metaConfirm(message: string, title = "확인"): Promise<boolean> {
  return new Promise((resolve) => { if (pushReq) pushReq({ kind: "confirm", title, message, resolve }); else resolve(window.confirm(message)); });
}

export function MetaModalHost() {
  const [queue, setQueue] = useState<Req[]>([]);
  useEffect(() => { pushReq = (r) => setQueue((q) => [...q, r]); return () => { pushReq = null; }; }, []);
  const cur = queue[0]; if (!cur) return null;
  const done = (v: boolean) => { cur.resolve(v); setQueue((q) => q.slice(1)); };
  const z = 1060 + queue.length * 10;
  return (
    <>
      <div className="modal fade modal--xsmall max-400 show" tabIndex={-1} role="dialog" style={{ display: "block", zIndex: z }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">{cur.title}</h5></div>
          <div className="modal-body text-center pl-40 pr-40"><p className="fw-600" style={{ whiteSpace: "pre-line" }}>{cur.message}</p></div>
          <div className="modal-footer">
            {cur.kind === "confirm" && <button className="cancel" onClick={() => done(false)}>취소</button>}
            <button className="submit" onClick={() => done(true)}>확인</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: z - 1 }}></div>
    </>
  );
}
