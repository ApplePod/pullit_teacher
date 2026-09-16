"use client";
import { RawHtml } from "@/components/RawHtml";

import { useEffect, useRef, useState } from "react";
import { fmtShort } from "@/lib/date";
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

/** 원본 화면 상단 페이지 헤더(라이브에서는 #contents .contents-header 가 숨김 처리되어 있다) */
export function ClinicHeader() {
  return (
    <div className="contents-header">
      <div className="contents-header__wrap">
        <div className="left-area">
          <img src="/assets/center/images/common/clinical_notes.svg" style={{ width: 32 }} alt="" />
          <h2>채점&클리닉</h2>
        </div>
        <div className="right-area">
          <button type="button" className="button__line button__fill--medium button__fill--red">
            <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>문제지 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 원본 시작일/종료일은 readonly 텍스트 입력 + jQuery UI datepicker 다.
 * 마크업(type="text" readonly)을 원본 그대로 두고, 달력은 같은 모양의 팝업으로 대신한다.
 */
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
function openDatePicker(input: HTMLInputElement, onPick: (v: string) => void) {
  document.getElementById("ui-datepicker-div")?.remove();
  const init = /^\d{4}-\d{2}-\d{2}$/.test(input.value) ? new Date(input.value) : new Date();
  let y = init.getFullYear(), m = init.getMonth();
  const box = document.createElement("div");
  box.id = "ui-datepicker-div";
  box.className = "ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all";
  box.style.cssText = "display:block;position:absolute;z-index:1100;width:216px;padding:8px;background:#fff;border:1px solid #dcdcde;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.12);font-size:12px";
  const draw = () => {
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells: string[] = [];
    for (let i = 0; i < first; i++) cells.push("<td></td>");
    for (let d = 1; d <= days; d++) cells.push(`<td><a href="#" class="ui-state-default" data-d="${d}" style="display:block;text-align:center;padding:3px 0;color:#333;text-decoration:none">${d}</a></td>`);
    const rows: string[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join("")}</tr>`);
    box.innerHTML =
      `<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all" style="display:flex;align-items:center;justify-content:space-between;padding-bottom:6px">` +
      `<a href="#" class="ui-datepicker-prev ui-corner-all" data-mv="-1" style="text-decoration:none;color:#333;padding:0 6px">&lt;</a>` +
      `<div class="ui-datepicker-title"><span class="ui-datepicker-year">${y}</span>년 <span class="ui-datepicker-month">${m + 1}</span>월</div>` +
      `<a href="#" class="ui-datepicker-next ui-corner-all" data-mv="1" style="text-decoration:none;color:#333;padding:0 6px">&gt;</a></div>` +
      `<table class="ui-datepicker-calendar" style="width:100%;border-collapse:collapse"><thead><tr>` +
      WEEK.map((w) => `<th style="font-weight:400;color:#8b8b8b;padding:2px 0">${w}</th>`).join("") +
      `</tr></thead><tbody>${rows.join("")}</tbody></table>`;
  };
  draw();
  const close = () => { box.remove(); document.removeEventListener("mousedown", outside, true); };
  const outside = (e: MouseEvent) => { if (!box.contains(e.target as Node) && e.target !== input) close(); };
  box.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest("a");
    if (!t) return;
    e.preventDefault();
    const mv = t.getAttribute("data-mv");
    if (mv) { m += Number(mv); if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; } draw(); return; }
    const d = t.getAttribute("data-d");
    if (d) { onPick(iso(new Date(y, m, Number(d)))); close(); }
  });
  const r = input.getBoundingClientRect();
  box.style.left = `${r.left + window.scrollX}px`;
  box.style.top = `${r.bottom + window.scrollY + 2}px`;
  document.body.appendChild(box);
  document.addEventListener("mousedown", outside, true);
  return close;
}

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
    // 시작일 / 종료일 — 원본 마크업(readonly 텍스트)을 그대로 두고 달력 팝업을 붙인다
    const sd = root.querySelector<HTMLInputElement>("input.startDate");
    const ed = root.querySelector<HTMLInputElement>("input.endDate");
    const bindPicker = (i: HTMLInputElement | null, set: (v: string) => void) => {
      if (!i) return;
      const open = (e: Event) => { e.preventDefault(); openDatePicker(i, (v) => { i.value = v; set(v); fire(); }); };
      on(i, "click", open);
      on(i.parentElement?.querySelector(".fa-calendar") ?? null, "click", open);
    };
    bindPicker(sd, (v) => { st.start = v; });
    bindPicker(ed, (v) => { st.end = v; });
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
    // 필터 펼치기 — 원본 filterMore2 그대로(아이콘 글자로 상태 판단, .fold-top 과 .fold 를 함께 토글)
    const more = root.querySelector<HTMLLabelElement>(".fold-top .listFilter-title");
    more?.removeAttribute("onclick");
    on(more, "click", () => {
      const ic = more?.querySelector(".material-symbols-sharp");
      const open = (ic?.textContent ?? "").trim() === "add";
      root.querySelectorAll(".fold-top, .fold").forEach((f) => f.classList.toggle("active", open));
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
  return <RawHtml html={html} ref={ref} />;
}

/**
 * 학습가능기간 칸 내용 — 원본은 채점 전(미채점)이면 기간설정 링크(a.btn-underline.f-12.lh-sm),
 * 채점이 끝났으면 글자(span)로만 보여준다.
 */
export function DurationCell({ from, to, editable }: { from: string | null; to: string | null; editable: boolean }) {
  const text = <span>{fmtShort(from)}<br />~{fmtShort(to)}</span>;
  if (!editable) return text;
  return (
    <a href="javascript:;" className="btn-underline f-12 lh-sm"
      onClick={(e) => { e.preventDefault(); void metaAlert("준비 중입니다."); }}>{text}</a>
  );
}

/** 목록 하단 — 총 N개 중 / 개씩 보기 / Scroll to Top / 페이지네이션 (원본 마크업) */
export function ListFoot({ total, size, setSize, page, setPage }: {
  total: number; size: number; setSize: (n: number) => void; page: number; setPage: (n: number) => void;
}) {
  const pages = Math.ceil(total / size);                   // 원본은 목록이 비면 0 페이지(다음 버튼이 살아 있다)
  const last = Math.max(1, pages);
  const sizeRef = useRef<HTMLSelectElement>(null);
  // 원본 select 는 selected 속성이 없다 — 값만 맞춘다
  useEffect(() => { if (sizeRef.current) sizeRef.current.value = String(size); }, [size]);
  const go = (n: number) => (e: React.MouseEvent) => { e.preventDefault(); if (n >= 1 && n <= last) setPage(n); };
  return (
    <div className="d-flex justify-content-between mt-16">
      <div className="d-flex align-items-center gap-2 f-14"> 총 {total}개 중
        <div className="select__small">
          <select ref={sizeRef} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
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
          {Array.from({ length: last }, (_, i) => (
            <a key={i} href="javascript:void(0);" className={page === i + 1 ? "active" : ""} onClick={go(i + 1)}>{i + 1}</a>
          ))}
          <a href="javascript:void(0);" className={`${page === pages ? "disabled " : ""}next`} onClick={go(page + 1)}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
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

export const fmtD = fmtShort;
export const bandOf = (grade?: string | null) =>
  !grade ? "" : grade.startsWith("e") ? "초등" : grade.startsWith("m") ? "중등" : grade.startsWith("h") ? "고등" : grade === "n" ? "N수" : "기타";
export const gradeOf = (grade?: string | null) => (grade ? GRADE_LABEL[grade] ?? grade : "");
export const STUDY_LABEL: Record<string, string> = { custom: "교과학습", level_test: "진단평가", achievement_test: "성취도평가", calculation: "연산" };

/**
 * 목록 행의 문제지 태그 줄 (원본 .tagline)
 * 원본은 단계·학년·교재레벨·학습구분·태그·문항수·채점방식·출제자 8 개 <p> 를 항상 만들고,
 * 값이 없는 항목만 display:none 으로 감춘다(v-show). 같은 규칙으로 맞춘다.
 */
export function Tagline({ grade, paperType, tags, count, maker, level }: {
  grade?: string | null; paperType: string; tags: string[]; count: number; maker: string | null; level?: string | null;
}) {
  const off = (v?: string | null) => (v ? undefined : { display: "none" });
  const band = grade ? bandOf(grade) : "";
  const gr = grade ? gradeOf(grade) : "";
  return (
    <div className="d-flex tagline">
      <p style={off(band)}>{band}</p>
      <p style={off(gr)}>{gr}</p>
      <p style={off(level)}>{level ?? ""}</p>
      <p>{STUDY_LABEL[paperType] ?? "교과학습"}</p>
      <p>{tags[0] ?? "기본"}</p>
      <p>{count}문항/1회차</p>
      <p>직접채점</p>
      <p className="fw-700">{maker ?? "-"}</p>
    </div>
  );
}
