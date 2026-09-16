"use client";

import { RawHtml } from "@/components/RawHtml";
import { useEffect, useState, useTransition } from "react";
import { fmtShort } from "@/lib/date";
import { ListTab } from "@/components/portal/ListTab";
import { PAPER_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { listPapers, togglePaperFlag, trashPapers, type PaperRow } from "./paperListActions";
import { MYPAPER_FILTER_HTML } from "./filterHtml";
import { FavSubTab } from "@/components/portal/FavSubTab";

const SUBJ: Record<string, string> = { math: "수학", english: "영어" };
const PTYPE: Record<string, string> = { custom: "직접출제", level_test: "레벨테스트", achievement_test: "성취도평가", calculation: "연산" };
const fmt = fmtShort;

type Mode = "mine" | "favorite" | "shared" | "trash";

/** 원본 화면별 안내 문구(휴지통에는 없음) */
const ALERT_TEXT: Partial<Record<Mode, string>> = {
  mine: "내가 만든 문제지입니다. 공유, 테마별 문제지도 복제 또는 수정하여 내 문제지로 가져올 수 있습니다.",
  favorite: "내 문제지, 공유, 테마별 문제지 중 자주 사용할 문제지를 즐겨찾기로 저장합니다.",
  shared: "교실 내 공유 문제지입니다. 내 문제지, 테마별 문제지도 공유할 수 있습니다.",
};

const PAGE_VIEW = 10;

/** 원본 문제지 보관함(mypaper/favorite/share/trash) 마크업 그대로 + 실데이터·동작 */
export function PaperListClient({ mode = "mine" }: { mode?: Mode }) {
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
  const needSel = async () => { if (ids.length === 0) { await metaAlert(mode === "trash" ? "목록의 체크박스를 선택하고 액션버튼(복원하기)을 눌러주세요." : "목록에서 문제지를 선택해 주세요."); return false; } return true; };
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const totalPages = Math.ceil(rows.length / PAGE_VIEW);
  const pageNums = Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1);

  /** 원본 table-head — 화면마다 컬럼 구성이 다르다 */
  const tableHead = (
    <ul className="table-head">
      <li style={{ maxWidth: 20 }}><input type="checkbox" className="form-check-input" id="selectAll" checked={rows.length > 0 && checked.size === rows.length} onChange={(e) => setChecked(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></li>
      <li className="title-line">문제지명</li>
      <li className={mode === "mine" ? "text-center" : ""} style={{ maxWidth: 60 }}>태그</li>
      <li style={{ maxWidth: 42 }}>채점형태</li>
      <li style={{ maxWidth: 54 }}>등록일</li>
      <li style={{ maxWidth: 52 }}>출제자</li>
      {mode === "trash" ? (
        <>
          <li style={{ maxWidth: 44 }}>새창</li>
          <li className="align-items-center" style={{ maxWidth: 60 }}>복원</li>
        </>
      ) : mode === "mine" ? (
        <>
          <li style={{ maxWidth: 44 }}>공유여부</li>
          <li style={{ maxWidth: 44 }}>즐겨찾기</li>
          <li style={{ maxWidth: 44 }}>새창</li>
          <li className="align-items-center" style={{ maxWidth: 60 }}>편집 수정</li>
        </>
      ) : (
        <>
          <li className="align-items-center" style={{ maxWidth: 44 }}>공유여부</li>
          <li className="align-items-center" style={{ maxWidth: 44 }}>즐겨찾기</li>
          <li className="align-items-center" style={{ maxWidth: 44 }}>새창</li>
          <li className="align-items-center" style={{ maxWidth: 60 }}>편집 수정</li>
        </>
      )}
    </ul>
  );

  const row = (r: PaperRow) => (
    <ul key={r.id} className="table-body table-hover-background">
      <li className={mode === "favorite" ? "check-block" : undefined} style={{ maxWidth: 20 }}>
        <input type="checkbox" className={mode === "favorite" ? "form-check-input" : "form-check-input selectChild"} name={mode === "mine" || mode === "trash" ? "f_check" : "paperCheckBox"} value={r.id} checked={checked.has(r.id)} onChange={() => toggle(r.id)} />
      </li>
      <li>
        <a href="#" data-bs-toggle="tooltip" data-bs-placement="top" className={mode === "favorite" || mode === "shared" ? "line-clamp-1 line-clamp-2 title-tooltip" : "line-clamp-1 title-tooltip"} title={r.name} onClick={(e) => { e.preventDefault(); layer.open(`/popup/paper/preview?ids=${r.id}`); }}>{r.name}</a>
        <div className="d-flex tagline"><p>{SUBJ[r.subject] ?? r.subject}</p>{r.unit_names.map((u) => <p key={u}>{u}</p>)}<p>{r.problem_count}문항</p><p>{PTYPE[r.paper_type] ?? r.paper_type}</p></div>
      </li>
      <li className="" style={{ maxWidth: 60 }}>{r.tags.length ? r.tags.join(", ") : "-"}</li>
      <li style={{ maxWidth: 42 }}>{r.grading}</li>
      <li style={{ maxWidth: 54 }}>{fmt(r.created_at)}</li>
      <li style={{ maxWidth: 52 }}><span className="line-clamp-2 f-12">{r.maker ?? "-"}</span></li>
      {mode === "trash" ? (
        <>
          <li style={{ maxWidth: 44 }}><i className="fa-solid fa-arrow-up-right-from-square f-14" aria-hidden="true" style={{ cursor: "pointer" }} onClick={() => layer.open(`/popup/paper/preview?ids=${r.id}`)}></i></li>
          <li className="align-items-center" style={{ maxWidth: 60 }}>
            <button type="button" className="button__fill button__line--xsmall button__line--white bw10" onClick={async () => { await trashPapers([r.id], true); load(); }}>복원</button>
          </li>
        </>
      ) : (
        <>
          <li className={mode === "mine" ? undefined : "align-items-center"} style={{ maxWidth: 44 }}>
            {/* 원본: 공유 안 된 문제지에 active(=eye-slash) 가 붙는다 */}
            {(mode !== "shared" || r.is_shared) && (
              <i className={`fa-sharp fa-solid fa-eye on-off-visibilty${r.is_shared ? "" : " active"}`} aria-hidden="true" style={{ cursor: "pointer" }}
                onClick={async () => { await togglePaperFlag([r.id], "is_shared", !r.is_shared); load(); }}></i>
            )}
          </li>
          <li className={mode === "mine" ? undefined : "align-items-center"} style={{ maxWidth: 44 }}
            onClick={mode === "shared" ? async () => { await togglePaperFlag([r.id], "is_favorite", !r.is_favorite); load(); } : undefined}>
            {mode === "favorite" ? (
              <button type="button" className="button__fill button__line--xsmall button__line--white bw10" onClick={async () => { await togglePaperFlag([r.id], "is_favorite", false); load(); }}>해제</button>
            ) : (
              <i className={`fa-sharp fa-light fa-bookmark on-off-bookmark${r.is_favorite ? " active" : ""}`} aria-hidden="true" style={{ cursor: "pointer" }}
                onClick={mode === "mine" ? async () => { await togglePaperFlag([r.id], "is_favorite", !r.is_favorite); load(); } : undefined}></i>
            )}
          </li>
          <li className={mode === "mine" ? undefined : "align-items-center"} style={{ maxWidth: 44 }}>
            <i className="fa-solid fa-arrow-up-right-from-square f-14" aria-hidden="true" style={{ cursor: "pointer" }} onClick={() => layer.open(`/popup/paper/preview?ids=${r.id}`)}></i>
          </li>
          <li className={mode === "mine" ? "align-items-center" : "align-items-end"} style={{ maxWidth: 60 }}>
            <button type="button" className="button__fill button__line--xsmall button__line--white bw10" onClick={() => metaAlert("복제편집은 준비 중입니다.")}>복제편집</button>
          </li>
        </>
      )}
    </ul>
  );

  /** 원본: 즐겨찾기 화면은 tab-content > tab-pane 안에, 나머지는 contens-body 바로 아래 */
  const body = (
    <>
      {ALERT_TEXT[mode] && <p className="alert-orange mt-24 mb-12">{ALERT_TEXT[mode]}</p>}
      <RawHtml html={MYPAPER_FILTER_HTML} />
      <div className="category-btns mt-24">
        <div className="left-area">
          {mode === "trash" ? (
            <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) { await trashPapers(ids, true); setChecked(new Set()); load(); } }}>복원하기</button>
          ) : (
            <>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/assign?ids=${ids.join(",")}`); }}>학생 배정</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/preview?ids=${ids.join(",")}&print=1`); }}>인쇄</button>
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) { await togglePaperFlag(ids, "is_favorite", mode !== "favorite"); setChecked(new Set()); load(); } }}>{mode === "favorite" ? "해제" : "즐겨찾기"}</button>
              {mode === "mine" && (
                <button type="button" className="category-btns-item" onClick={async () => { if (await needSel() && await metaConfirm("선택한 문제지를 삭제할까요?")) { await trashPapers(ids); setChecked(new Set()); load(); } }}>삭제</button>
              )}
              <button type="button" className="category-btns-item" onClick={async () => { if (await needSel()) await metaAlert("엑셀 다운로드는 준비 중입니다."); }}>
                <i className="fa-sharp fa-solid fa-download" aria-hidden="true"></i>
                엑셀다운
              </button>
            </>
          )}
        </div>
        {mode !== "trash" && (
          <div className="right-area">
            <div className="select-item"><select defaultValue="detail"><option value="detail">전체 리스트</option><option value="summary">요약 리스트</option></select></div>
            <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => layer.open("/popup/paper/make")}>
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>
              문제지 만들기
            </button>
          </div>
        )}
      </div>
      <div className="list-basic-check mt-8">
        {tableHead}
        {rows.length === 0 && <div className="null-item">{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</div>}
        {rows.map(row)}
      </div>
      <div className="d-flex justify-content-between mt-16">
        <div className="d-flex align-items-center gap-2 f-14">
          총 {rows.length}개 중
          <div className="select__small">
            <select defaultValue={String(PAGE_VIEW)}><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option><option value="50">50</option></select>
          </div>
          개씩 보기
        </div>
        <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i>
          <span>Scroll to Top</span>
        </button>
        <div className="pagination">
          <div className="pagination__wrap">
            <a href="#" className="prev disabled" onClick={(e) => e.preventDefault()}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
            {pageNums.map((n) => <a key={n} href="#" className={n === 1 ? "active" : ""} onClick={(e) => e.preventDefault()}>{n}</a>)}
            <a href="#" className={totalPages > 0 && totalPages <= 1 ? "disabled next" : "next"} onClick={(e) => e.preventDefault()}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="contens-body">
        {layer.popup}
        <ListTab tabs={PAPER_TABS} linkWrapped={mode === "mine" || mode === "trash"} />
        {mode === "favorite" ? (
          <>
            <FavSubTab current="paper" />
            <div className="tab-content">
              <div className="tab-pane fade active show" id="tab-pane-2-1" role="tabpanel" tabIndex={0}>{body}</div>
            </div>
          </>
        ) : body}
      </div>
      {mode === "trash" && (
        <div className="alert alert-warning alert-dismissible fade alert-fixed" role="alert">
          <span className="material-symbols-sharp">error</span>
          <div className="msg">목록의 체크박스를 선택하고 액션버튼(복원하기)을 눌러주세요.</div>
          <button id="warningclosebutton" type="button" className="btn-close" aria-label="Close"></button>
        </div>
      )}
    </>
  );
}
