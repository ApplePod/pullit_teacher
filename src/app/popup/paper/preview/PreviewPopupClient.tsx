"use client";

import { useEffect, useState } from "react";
import { PaperSheet, type SheetMeta, type SheetMode } from "@/components/PaperSheet";
import type { Problem } from "@/components/ProblemView";
import { closeLayerPopup } from "@/components/portal/LayerPopup";

export interface PopupPaper { meta: SheetMeta; problems: Problem[] }

function printSheets() {
  document.querySelectorAll<HTMLIFrameElement>(".pt-sheet-host iframe").forEach((f) => { try { f.contentWindow?.focus(); f.contentWindow?.print(); } catch { /* noop */ } });
}

/** 원본 /pages/bank/printpaper 화면(mark-header 상단바 + print__header 안내 + 시험지) */
export function PrintPopupClient({ papers }: { papers: PopupPaper[] }) {
  return (
    <div id="wrap">
      <div className="mark-header">
        <ul className="mark-header__top input-title">
          <li><button type="button" onClick={() => closeLayerPopup()}><i className="fa-sharp fa-regular fa-close" aria-hidden="true"></i> 닫기 </button></li>
          <li className="title-area"></li>
          <li><button type="button" className="button__line button__line--xsmall button__fill--red" style={{ color: "#fff", border: "1px solid rgb(250, 49, 88)" }} onClick={printSheets}><i className="fa-sharp fa-solid fa-print" aria-hidden="true"></i> 인쇄하기 </button></li>
        </ul>
      </div>
      <div id="contents" className="include-right">
        <div className="print mt-8">
          <div className="print__header"><div className="d-flex gap-2 align-items-center"><p className="alert-orange">2p. 미리보기 화면입니다. 전체 문제지를 보시려면 인쇄하기를 눌러주세요.</p><p className="f-14 fw-700 h-24"></p></div></div>
          <div className="print__wrap pt-16 pb-16">
            <article className="edite-contents max-width-100">
              {papers.map((p, i) => <div key={i} className="pt-sheet-host"><PaperSheet problems={p.problems} meta={p.meta} mode="problem" /></div>)}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 원본 previewpaper 모달(#preview01 modal--xlarge): 문제보기/해설보기 라디오 + 시험지 */
export function PreviewPopupClient({ papers }: { papers: PopupPaper[] }) {
  const [mode, setMode] = useState<SheetMode>("problem");
  useEffect(() => { document.body.classList.add("modal-open"); return () => document.body.classList.remove("modal-open"); }, []);
  return (
    <div className="modal modal-inner-scroll fade modal--xlarge show" id="preview01" tabIndex={-1} style={{ display: "block", position: "static" }} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-dialog-centered" style={{ margin: "0 auto" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h6>미리보기</h6>
            <div className="d-flex justify-content-between pl-24 pr-24 w-100">
              <div className="d-flex gap-3 align-items-center">
                <label className="f-16 fw-700 bw10"></label>
                <div className="filter-radio">
                  <input type="radio" name="radio6-" id="radio6-01" value="P" checked={mode === "problem"} onChange={() => setMode("problem")} /><label className="col" htmlFor="radio6-01">문제보기</label>
                  <input type="radio" name="radio6-" id="radio6-02" value="S" checked={mode === "solution"} onChange={() => setMode("solution")} /><label className="col" htmlFor="radio6-02">해설보기</label>
                </div>
                <button type="button" className="button__line button__fill--small button__fill--red" onClick={printSheets}> 인쇄하기 </button>
              </div>
              <div></div>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => closeLayerPopup()}><span className="material-symbols-sharp">close</span></button>
          </div>
          <div className="modal-body pt-24 pb-24 pl-24 pr-24">
            <div className="print">
              <div className="print__wrap" style={{ height: "calc(100dvh - 186px)", overflow: "auto" }}>
                <article className="edite-contents" style={{ maxWidth: "inherit", width: "100%" }}>
                  {papers.map((p, i) => <div key={i} className="pt-sheet-host"><PaperSheet problems={p.problems} meta={p.meta} mode={mode} /></div>)}
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
