"use client";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { PAPER_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { listPapers, togglePaperFlag, trashPapers, type PaperRow } from "./paperListActions";
import { MYPAPER_FILTER_HTML } from "./filterHtml";
import { FavSubTab } from "@/components/portal/FavSubTab";

const SUBJ: Record<string, string> = { math: "수학", english: "영어" };
const PTYPE: Record<string, string> = { custom: "직접출제", level_test: "레벨테스트", achievement_test: "성취도평가", calculation: "연산" };
const fmt = (d: string) => { const x = new Date(d); return `${String(x.getFullYear()).slice(2)}.${String(x.getMonth() + 1).padStart(2, "0")}.${String(x.getDate()).padStart(2, "0")}`; };

/** 원본 내 문제지 화면(mypaper) 마크업 그대로 + 실데이터·동작 */
export function PaperListClient({ mode = "mine" }: { mode?: "mine" | "favorite" | "shared" | "trash" }) {
  const [rows, setRows] = useState<PaperRow[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [pending, start] = useTransition();
  const layer = useLayerPopup();
  const load = () => start(async () => setRows(await listPapers({ search, favorite: mode === "favorite", shared: mode === "shared", trash: mode === "trash" })));
  useEffect(() => {
    // 원본 필터 블록의 검색 입력 연결
    const inp = document.querySelector<HTMLInputElement>('.listFilter-wrap input[type="search"]'); const btn = inp?.parentElement?.querySelector("button");
    const go = () => { setSearch(inp?.value ?? ""); start(async () => setRows(await listPapers({ search: inp?.value ?? "", favorite: mode === "favorite", shared: mode === "shared", trash: mode === "trash" }))); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") go(); };
    go();
    inp?.addEventListener("keydown", onKey); btn?.addEventListener("click", go);
    return () => { inp?.removeEventListener("keydown", onKey); btn?.removeEventListener("click", go); };
  }, [mode]);
  const ids = [...checked];
  const needSel = async () => { if (ids.length === 0) { await metaAlert("목록에서 문제지를 선택해 주세요."); return false; } return true; };
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="contens-body">
      {layer.popup}
      <ListTab tabs={PAPER_TABS} className={mode === "favorite" ? "" : "mb-24"} />
      {mode === "favorite" && <><FavSubTab current="paper" /><p className="alert-orange mt-24 mb-12">내 문제지, 공유, 테마별 문제지 중 자주 사용할 문제지를 즐겨찾기로 저장합니다.</p></>}
      {mode === "mine" && <p className="alert-orange mt-24 mb-12">내가 만든 문제지입니다. 공유, 테마별 문제지도 복제 또는 수정하여 내 문제지로 가져올 수 있습니다.</p>}
      {mode === "shared" && <p className="alert-orange mt-24 mb-12">교실 내 공유 문제지입니다. 내 문제지, 테마별 문제지도 공유할 수 있습니다.</p>}
      <div dangerouslySetInnerHTML={{ __html: MYPAPER_FILTER_HTML }} />
      <div className="category-btns mt-24">
        <div className="left-area">
          {mode !== "trash" ? (
            <>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/assign?ids=${ids.join(",")}`); }}>학생 배정</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/preview?ids=${ids.join(",")}&print=1`); }}>인쇄</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) { await togglePaperFlag(ids, "is_favorite", mode !== "favorite"); setChecked(new Set()); load(); } }}>{mode === "favorite" ? "해제" : "즐겨찾기"}</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel() && await metaConfirm("선택한 문제지를 삭제할까요?")) { await trashPapers(ids); setChecked(new Set()); load(); } }}>삭제</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) await metaAlert("엑셀 다운로드는 준비 중입니다."); }}><i className="fa-solid fa-download" aria-hidden="true"></i> 엑셀다운 </button>
            </>
          ) : (
            <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) { await trashPapers(ids, true); setChecked(new Set()); load(); } }}>복원하기</button>
          )}
        </div>
        <div className="right-area">
          <div className="select-item"><select><option value="detail">전체 리스트</option><option value="summary">요약 리스트</option></select></div>
          <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => layer.open("/popup/paper/make")}><i className="fa-solid fa-pencil" aria-hidden="true"></i> 문제지 만들기 </button>
        </div>
      </div>
      <div className="list-basic-check mt-8">
        <ul className="table-head">
          <li style={{ maxWidth: 20 }}><input type="checkbox" className="form-check-input" id="selectAll" checked={rows.length > 0 && checked.size === rows.length} onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></li>
          <li className="title-line">문제지명</li><li className="text-center" style={{ maxWidth: 60 }}>태그</li><li style={{ maxWidth: 42 }}>채점형태</li><li style={{ maxWidth: 54 }}>등록일</li>
          <li style={{ maxWidth: 52 }}>출제자</li><li style={{ maxWidth: 44 }}>공유여부</li><li style={{ maxWidth: 44 }}>즐겨찾기</li><li style={{ maxWidth: 44 }}>새창</li><li className="align-items-center" style={{ maxWidth: 60 }}>편집</li>
        </ul>
        {rows.map((r) => (
          <ul key={r.id} className="table-body table-hover-background">
            <li style={{ maxWidth: 20 }}><input type="checkbox" className="form-check-input selectChild" name="f_check" value={r.id} checked={checked.has(r.id)} onChange={() => toggle(r.id)} /></li>
            <li className="title-line">
              <a href="#" className="line-clamp-1 title-tooltip" title={r.name} onClick={(e) => { e.preventDefault(); layer.open(`/popup/paper/preview?ids=${r.id}`); }}>{r.name}</a>
              <div className="d-flex tagline"><p>{SUBJ[r.subject] ?? r.subject}</p>{r.unit_names.map((u) => <p key={u}>{u}</p>)}<p>{r.problem_count}문항</p><p>{PTYPE[r.paper_type] ?? r.paper_type}</p></div>
            </li>
            <li style={{ maxWidth: 60 }} className="text-center">{r.tags.length ? r.tags.join(", ") : "-"}</li>
            <li style={{ maxWidth: 42 }}>{r.grading}</li>
            <li style={{ maxWidth: 54 }}>{fmt(r.created_at)}</li>
            <li style={{ maxWidth: 52 }}><span className="line-clamp-2 f-12">{r.maker ?? "-"}</span></li>
            <li style={{ maxWidth: 44 }}><i className={`fa-solid fa-eye on-off-visibilty${r.is_shared ? " active" : ""}`} aria-hidden="true" style={{ cursor: "pointer" }} onClick={async () => { await togglePaperFlag([r.id], "is_shared", !r.is_shared); load(); }}></i></li>
            <li style={{ maxWidth: 44 }}><i className={`${r.is_favorite ? "fa-solid" : "fa-regular"} fa-bookmark on-off-bookmark${r.is_favorite ? " active" : ""}`} aria-hidden="true" style={{ cursor: "pointer" }} onClick={async () => { await togglePaperFlag([r.id], "is_favorite", !r.is_favorite); load(); }}></i></li>
            <li style={{ maxWidth: 44 }}><i className="fa-solid fa-arrow-up-right-from-square f-14" aria-hidden="true" style={{ cursor: "pointer" }} onClick={() => layer.open(`/popup/paper/preview?ids=${r.id}`)}></i></li>
            <li className="align-items-center" style={{ maxWidth: 60 }}><button type="button" className="button__fill button__line--xsmall button__line--white bw10" onClick={() => metaAlert("복제편집은 준비 중입니다.")}> 복제편집 </button></li>
          </ul>
        ))}
        {rows.length === 0 && <ul className="table-body"><li className="null-item" style={{ justifyContent: "center", padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 문제지가 없습니다."}</li></ul>}
      </div>
    </div>
  );
}
