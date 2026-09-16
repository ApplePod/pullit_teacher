"use client";

/**
 * 원본(메타수학) 부트스트랩 모달 마크업 그대로.
 * .modal.fade.show > .modal-dialog.modal-dialog-centered > .modal-content > .modal-header(h6.f-14 + .btn-close) / .modal-body / .modal-footer
 * 푸터 버튼 클래스도 원본과 동일: 취소=button__fill button__line--small button__line--white button__weight--medium, 적용=button__fill button__fill--small button__fill--secondary
 */
export function OriginalModal({ id, title, size = "max-450", onClose, children, footer }: {
  id: string; title: React.ReactNode; size?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <>
      <div className={`modal fade modal-inner-scroll ${size} show`} id={id} tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">{title}</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
export const BTN_CANCEL = "button__fill button__line--small button__line--white button__weight--medium";
export const BTN_APPLY = "button__fill button__fill--small button__fill--secondary";
export const BTN_WHITE_XS = "button__fill button__line--xsmall button__line--white bw10";
export const BTN_RED_MD = "button__line button__fill--medium button__fill--red";
