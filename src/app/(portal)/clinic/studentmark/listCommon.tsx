"use client";

import { useEffect, useRef, useState } from "react";
import { metaAlert } from "@/components/portal/MetaModal";
import { GRADE_LABEL } from "@/lib/mgmt-consts";

/** 채점&클리닉 목록 화면 공용 — 원본 listFilter-wrap 블록 연결, 페이지네이션, 태그라인 */

export interface FilterState {
  dateField: string; start: string; end: string;
  searchField: string; keyword: string;
  band: string; markYn: string; enoteYn: string; study: string; tag: string;
  code: string; homeYn: string; kakaoYn: string; smsYn: string;
}
export const EMPTY_FILTER: FilterState = {
  dateField: "assign_dt", start: "", end: "", searchField: "", keyword: "",
  band: "", markYn: "", enoteYn: "", study: "", tag: "", code: "", homeYn: "", kakaoYn: "", smsYn: "",
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * 원본 필터 블록(HTML 그대로)을 붙이고 각 컨트롤을 연결한다.
 * 1년/6개월 period-btn · 연도선택 · 시작일/종료일 · 검색 · 초등/중등/고등 · 추가 · 초기화 · 필터 저장 · 필터 펼치기(filterMore2).
 */
export function OriginalFilter({ html, storeKey, onChange }: { html: string; storeKey: string; onChange: (f: FilterState) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onChange);
  useEffect(() => { cb.current = onChange; });
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const st: FilterState = { ...EMPTY_FILTER };
    // 원본은 각 필터 묶음의 '전체'(value="") 가 선택된 상태로 렌더된다
    root.querySelectorAll<HTMLInputElement>('.filter-check input[value=""]').forEach((i) => { i.checked = true; });
    const fire = () => cb.current({ ...st });
    const cleanup: (() => void)[] = [];
    const on = (el: Element | null, ev: string, fn: EventListenerOrEventListenerObject) => {
      if (!el) return; el.addEventListener(ev, fn); cleanup.push(() => el.removeEventListener(ev, fn));
    };
    // 시작일 / 종료일 (원본은 jQuery datepicker — 여기서는 날짜 입력으로 동작)
    const sd = root.querySelector<HTMLInputElement>("input.startDate");
    const ed = root.querySelector<HTMLInputElement>("input.endDate");
    [sd, ed].forEach((i) => { if (i) { i.type = "date"; i.removeAttribute("readonly"); } });
    on(sd, "change", () => { st.start = sd?.value ?? ""; fire(); });
    on(ed, "change", () => { st.end = ed?.value ?? ""; fire(); });
    const setRange = (from: Date, to: Date) => {
      st.start = iso(from); st.end = iso(to);
      if (sd) sd.value = st.start; if (ed) ed.value = st.end;
      fire();
    };
    // 1년 / 6개월
    root.querySelectorAll<HTMLButtonElement>(".period-btn").forEach((b) => {
      on(b, "click", (e) => {
        e.preventDefault();
        const to = new Date(); const from = new Date();
        if (b.dataset.range === "365") from.setFullYear(from.getFullYear() - 1); else from.setMonth(from.getMonth() - 6);
        from.setDate(from.getDate() + 1);
        setRange(from, to);
      });
    });
    // 연도선택
    const ys = root.querySelector<HTMLSelectElement>("select.year-select");
    on(ys, "change", () => {
      const y = ys?.value;
      if (!y) { st.start = ""; st.end = ""; if (sd) sd.value = ""; if (ed) ed.value = ""; fire(); return; }
      setRange(new Date(Number(y), 0, 1), new Date(Number(y), 11, 31));
    });
    // 배정일 / 채점일
    const df = root.querySelector<HTMLSelectElement>("ul > li > .listFilter-items > .select__small > select");
    on(df, "change", () => { st.dateField = df?.value ?? "assign_dt"; fire(); });
    // 검색어
    const ss = root.querySelector<HTMLSelectElement>(".search-select .select__small select");
    const si = root.querySelector<HTMLInputElement>('.search-input input[type="search"]');
    const sb = root.querySelector<HTMLButtonElement>(".search-input button");
    const doSearch = () => { st.searchField = ss?.value ?? ""; st.keyword = si?.value ?? ""; fire(); };
    on(ss, "change", () => { st.searchField = ss?.value ?? ""; });
    on(si, "keydown", (e) => { if ((e as KeyboardEvent).key === "Enter") { e.preventDefault(); doSearch(); } });
    on(sb, "click", (e) => { e.preventDefault(); doSearch(); });
    // 라디오 필터 (초등/중등/고등 · 학습 구분 · 태그 · 채점 상태 · 오답출제 · 분석표 종류 · 발송 상태)
    const onChangeRadio = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (!t || t.tagName !== "INPUT" || t.type !== "radio") return;
      const group = t.closest(".filter-radio, .filter-check");
      if (group?.classList.contains("filter-radio")) {
        root.querySelectorAll<HTMLInputElement>(".filter-radio input[type=radio]").forEach((x) => { if (x !== t) x.checked = false; });
        st.band = st.band === t.value ? "" : t.value;
        if (!st.band) t.checked = false;
      } else {
        group?.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((x) => { if (x !== t) x.checked = false; });
        const nm = t.name, id = t.id;
        if (nm === "filterMarkYn") st.markYn = t.value;
        else if (nm === "filterEnoteYn") st.enoteYn = t.value;
        else if (nm === "filterReport") st.code = t.value;
        else if (nm === "filtershowyn") st.homeYn = t.value;
        else if (nm === "kakao") st.kakaoYn = t.value;
        else if (nm === "sms") st.smsYn = t.value;
        else if (id.startsWith("tag_")) st.tag = t.value;
        else if (id.startsWith("studylist")) st.study = t.value;
      }
      fire();
    };
    root.addEventListener("change", onChangeRadio);
    cleanup.push(() => root.removeEventListener("change", onChangeRadio));
    // 필터 펼치기 (원본 filterMore2)
    const more = root.querySelector<HTMLLabelElement>(".fold-top .listFilter-title");
    more?.removeAttribute("onclick");
    if (more?.closest(".fold-top")?.classList.contains("active")) {   // 원본에서 펼쳐진 상태로 시작하는 화면
      root.querySelectorAll(".fold").forEach((f) => f.classList.add("active"));
      const ic0 = more.querySelector(".material-symbols-sharp");
      if (ic0) ic0.textContent = "remove";
    }
    on(more, "click", () => {
      const top = more?.closest(".fold-top");
      const open = !top?.classList.contains("active");
      top?.classList.toggle("active", open);
      root.querySelectorAll(".fold").forEach((f) => f.classList.toggle("active", open));
      const ic = more?.querySelector(".material-symbols-sharp");
      if (ic) ic.textContent = open ? "remove" : "add";
    });
    // 추가 / 삭제 (필터 줄 추가)
    const add = root.querySelector<HTMLButtonElement>('.btn-add-delete[data-type="add"]');
    let seq = 0;
    on(add, "click", (e) => {
      e.preventDefault();
      const base = root.querySelector(".filter-radio"); if (!base || !add?.parentElement) return;
      seq += 1;
      const wrap = document.createElement("div");
      wrap.className = "d-flex gap-1 align-items-center w-100";
      wrap.innerHTML = base.outerHTML.replace(/filterEMH_0_/g, `filterEMH_${seq}_`)
        + `<button type="button" class="btn-add-delete" data-type="delete"><span class="material-symbols-sharp">remove</span> 삭제 </button>`;
      wrap.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((x) => { x.checked = false; });
      add.parentElement.appendChild(wrap);
      wrap.querySelector('[data-type="delete"]')?.addEventListener("click", (ev) => { ev.preventDefault(); wrap.remove(); });
    });
    // 초기화 / 필터 저장
    const unders = root.querySelectorAll<HTMLButtonElement>(".btn-underline");
    on(unders[0] ?? null, "click", (e) => {
      e.preventDefault();
      root.querySelectorAll<HTMLInputElement>("input[type=radio]").forEach((x) => { x.checked = false; });
      root.querySelectorAll<HTMLInputElement>('input[type="search"]').forEach((x) => { x.value = ""; });
      if (sd) sd.value = ""; if (ed) ed.value = "";
      root.querySelectorAll<HTMLSelectElement>("select").forEach((x) => { x.selectedIndex = 0; });
      root.querySelectorAll('.btn-add-delete[data-type="delete"]').forEach((b) => b.parentElement?.remove());
      Object.assign(st, EMPTY_FILTER);
      fire();
    });
    on(unders[1] ?? null, "click", (e) => {
      e.preventDefault();
      try { window.localStorage.setItem(`clinicFilter:${storeKey}`, JSON.stringify(st)); } catch { /* 저장 불가 무시 */ }
      void metaAlert("필터를 저장했습니다.");
    });
    return () => cleanup.forEach((f) => f());
  }, [storeKey]);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** 목록 하단 — 총 N개 중 / 개씩 보기 / Scroll to Top / 페이지네이션 (원본 마크업) */
export function ListFoot({ total, size, setSize, page, setPage }: {
  total: number; size: number; setSize: (n: number) => void; page: number; setPage: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  const go = (n: number) => (e: React.MouseEvent) => { e.preventDefault(); if (n >= 1 && n <= pages) setPage(n); };
  return (
    <div className="d-flex justify-content-between mt-16">
      <div className="d-flex align-items-center gap-2 f-14"> 총 {total}개 중
        <div className="select__small">
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
            <option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option><option value="50">50</option>
          </select>
        </div> 개씩 보기
      </div>
      <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i><span>Scroll to Top</span>
      </button>
      <div className="pagination">
        <div className="pagination__wrap">
          <a href="javascript:void(0);" className={`prev${page <= 1 ? " disabled" : ""}`} onClick={go(page - 1)}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
          {Array.from({ length: pages }, (_, i) => (
            <a key={i} href="javascript:void(0);" className={page === i + 1 ? "active" : ""} onClick={go(i + 1)}>{i + 1}</a>
          ))}
          <a href="javascript:void(0);" className={`${page >= pages ? "disabled " : ""}next`} onClick={go(page + 1)}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
        </div>
      </div>
    </div>
  );
}

/** 목록 페이지 상태 (페이지·개수) */
export function usePaging<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, pages);                       // 목록이 줄어들면 마지막 페이지로
  const view = rows.slice((cur - 1) * size, cur * size);
  return { page: cur, setPage, size, setSize, view };
}

export const fmtD = (v?: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};
export const bandOf = (grade?: string | null) =>
  !grade ? "" : grade.startsWith("e") ? "초등" : grade.startsWith("m") ? "중등" : grade.startsWith("h") ? "고등" : grade === "n" ? "N수" : "기타";
export const gradeOf = (grade?: string | null) => (grade ? GRADE_LABEL[grade] ?? grade : "");
export const STUDY_LABEL: Record<string, string> = { custom: "교과학습", level_test: "진단평가", achievement_test: "성취도평가", calculation: "연산" };

/** 목록 행의 문제지 태그 줄 (원본 .tagline) */
export function Tagline({ grade, paperType, tags, count, maker }: {
  grade?: string | null; paperType: string; tags: string[]; count: number; maker: string | null;
}) {
  return (
    <div className="d-flex tagline">
      {grade ? <p>{bandOf(grade)}</p> : null}
      {grade ? <p>{gradeOf(grade)}</p> : null}
      <p>{STUDY_LABEL[paperType] ?? "교과학습"}</p>
      <p>{tags[0] ?? "기본"}</p>
      <p>{count}문항/1회차</p>
      <p>직접채점</p>
      <p className="fw-700">{maker ?? "-"}</p>
    </div>
  );
}
