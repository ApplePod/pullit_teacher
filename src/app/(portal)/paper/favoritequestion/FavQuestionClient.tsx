"use client";

import { RawHtml } from "@/components/RawHtml";
import { SelectAllCheckbox } from "@/components/portal/SelectAllCheckbox";
import { useEffect, useState, useTransition } from "react";
import { fmtShort } from "@/lib/date";
import { ListTab } from "@/components/portal/ListTab";
import { PAPER_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { OriginalModal, BTN_CANCEL, BTN_APPLY } from "@/components/portal/OriginalModal";
import { listFavFolders, createFavFolder, renameFavFolder, deleteFavFolders, type FavFolder } from "./favActions";
import { FAVQ_FILTER_HTML } from "./filterHtml";
import { FavSubTab } from "@/components/portal/FavSubTab";

const fmt = fmtShort;

/** 원본 Paper/favoriteQuestion.cshtml — 즐겨찾는 문항 폴더 목록 */
export function FavQuestionClient() {
  const [rows, setRows] = useState<FavFolder[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ id?: string; name: string } | null>(null);
  const [pending, start] = useTransition();
  const layer = useLayerPopup();
  const load = (search = "") => start(async () => setRows(await listFavFolders(search)));
  useEffect(() => {
    const inp = document.querySelector<HTMLInputElement>('.listFilter-wrap input[type="search"]');
    const btn = inp?.parentElement?.querySelector("button");
    const go = () => load(inp?.value ?? "");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") go(); };
    go();
    inp?.addEventListener("keydown", onKey); btn?.addEventListener("click", go);
    return () => { inp?.removeEventListener("keydown", onKey); btn?.removeEventListener("click", go); };
  }, []);
  const ids = [...checked];
  const save = async () => {
    if (!modal) return;
    const r = modal.id ? await renameFavFolder(modal.id, modal.name) : await createFavFolder(modal.name);
    if (r.error) { await metaAlert(r.error); return; }
    setModal(null); load();
  };
  /** 원본: 문제지/문항 2차 탭 때문에 본문이 tab-content > tab-pane 안에 들어간다 */
  const body = (
    <>
      <p className="alert-orange mt-24 mb-12">자주 사용하는 문항을 즐겨찾기로 저장합니다.</p>
      <RawHtml html={FAVQ_FILTER_HTML} />
      <div className="category-btns mt-24">
        <div className="left-area">
          <button type="button" className="category-btns-item" onClick={async () => {
            if (ids.length === 0) { await metaAlert("목록에서 폴더를 선택해 주세요."); return; }
            if (!(await metaConfirm("선택한 문항 즐겨찾기를 삭제할까요?"))) return;
            const r = await deleteFavFolders(ids); if (r.error) { await metaAlert(r.error); return; }
            setChecked(new Set()); load();
          }}>삭제</button>
        </div>
        <div className="right-area">
          <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => setModal({ name: "" })}>
            <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i> 문항 즐겨찾기 만들기 </button>
        </div>
      </div>
      <div className="list-basic-check mt-8">
        <ul className="table-head gap-4-5">
          <li style={{ maxWidth: 20 }}><SelectAllCheckbox  id="selectAll" className="form-check-input"   total={rows.length} allSelected={checked.size === rows.length} onToggle={(v) => setChecked(v ? new Set(rows.map((r) => r.id)) : new Set())} /></li>
          <li className="title-line">즐겨찾는 문항 폴더명</li>
          <li style={{ maxWidth: 80 }}>문항 수</li>
          <li style={{ maxWidth: 64 }}>최종 수정일</li>
          <li style={{ maxWidth: 52 }}>등록자</li>
          <li style={{ maxWidth: 60 }}>편집</li>
        </ul>
        {rows.map((r) => (
          <ul key={r.id} className="table-body table-hover-background gap-4-5">
            <li className="check-block" style={{ maxWidth: 20 }}><input type="checkbox" className="form-check-input" name="paperCheckBox" value={r.id} checked={checked.has(r.id)} onChange={() => setChecked((c) => { const n = new Set(c); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} /></li>
            <li><a href="#" data-bs-toggle="tooltip" data-bs-placement="top" className="line-clamp-1 line-clamp-2 title-tooltip" title={r.name} onClick={(e) => { e.preventDefault(); layer.open(`/popup/paper/favoritequestion?id=${r.id}`); }}>{r.name}</a></li>
            <li style={{ maxWidth: 80 }}>{r.count}문항</li>
            <li style={{ maxWidth: 64 }}>{fmt(r.updated_at)}</li>
            <li style={{ maxWidth: 52 }}><span className="line-clamp-2 f-12">{r.owner ?? "-"}</span></li>
            <li style={{ maxWidth: 60 }}><button type="button" className="button__fill button__line--xsmall button__line--white bw10" style={{ maxWidth: 52 }} onClick={() => setModal({ id: r.id, name: r.name })}>편집</button></li>
          </ul>
        ))}
        {rows.length === 0 && <div className="null-item">{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</div>}
      </div>
      <div className="d-flex justify-content-between mt-16">
        <div className="d-flex align-items-center gap-2 f-14"> 총 {rows.length}개 중 <div className="select__small"><select defaultValue="10"><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option><option value="50">50</option></select></div> 개씩 보기 </div>
        <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i><span>Scroll to Top</span></button>
        <div className="pagination"><div className="pagination__wrap"><a href="javascript:void(0);" className="prev disabled"><i className="fa-light fa-angle-left" aria-hidden="true"></i></a><a href="javascript:void(0);" className="active">1</a><a href="javascript:void(0);" className="next"><i className="fa-light fa-angle-right" aria-hidden="true"></i></a></div></div>
      </div>
    </>
  );

  return (
    <div className="contens-body">
      {layer.popup}
      <ListTab tabs={PAPER_TABS} />
      <FavSubTab current="question" />
      <div className="tab-content">
        <div className="tab-pane fade active show" id="tab-pane-2-2" role="tabpanel" tabIndex={0}>{body}</div>
      </div>
      {modal && (
        <OriginalModal id="modalFavFolder" title={modal.id ? "문항 즐겨찾기 이름 수정" : "문항 즐겨찾기 만들기"} size="max-450" onClose={() => setModal(null)}
          footer={<><button type="button" className={BTN_CANCEL} onClick={() => setModal(null)}>취소</button><button type="button" className={BTN_APPLY} onClick={save}>저장</button></>}>
          <div className="input-item">
            <label className="input-title">폴더명</label>
            <input type="text" className="form-control" value={modal.name} autoFocus placeholder="폴더명을 입력해 주세요."
              onChange={(e) => setModal({ ...modal, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") void save(); }} />
          </div>
        </OriginalModal>
      )}
    </div>
  );
}
