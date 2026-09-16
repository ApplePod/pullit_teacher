"use client";

import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";

import { fmtShort } from "@/lib/date";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
import { STUDENT_FILTER_HTML } from "./filterHtml";
import { listStudents, deleteStudents, bulkUpdateStudents, bulkCreateStudents, type StudentRow } from "./studentActions";

const LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"];
const STATES: [string, string][] = [["active", "정규"], ["paused", "휴회"]];
/** 원본 학년 코드(GRE0…GR99) ↔ 우리 grade_code */
const GRADE_BY_CODE: Record<string, string> = {
  GRE0: "e0", GRE1: "e1", GRE2: "e2", GRE3: "e3", GRE4: "e4", GRE5: "e5", GRE6: "e6",
  GRM1: "m1", GRM2: "m2", GRM3: "m3", GRH1: "h1", GRH2: "h2", GRH3: "h3", GR99: "etc",
};
/** 원본 학적 상태 코드 ↔ 우리 state */
const STATE_BY_CODE: Record<string, string> = { MS01: "paused", MS10: "active", MS99: "left" };
const LEVEL_BY_CODE: Record<string, string> = Object.fromEntries(LEVELS.map((l, i) => [`SL0${i + 1}`, l]));
const fmtD = fmtShort;
const BAND: Record<string, string> = { e: "초등", m: "중등", h: "고등" };

export function StudentClient() {
  const router = useRouter();
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [search] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState(false);
  const [bigModal, setBigModal] = useState(false);
  const [pending, start] = useTransition();
  const [flt, setFlt] = useState<{ field: string; kw: string; grades: string[]; levels: string[]; states: string[] }>({ field: "f_user_nm", kw: "", grades: [], levels: [], states: [] });
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const fltRef = useRef(flt); useEffect(() => { fltRef.current = flt; });

  const load = (s?: string) => start(async () => setRows(await listStudents(s)));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const tgt = e.target as HTMLElement; if (tgt && /INPUT|TEXTAREA/.test(tgt.tagName)) return;
      const text = e.clipboardData?.getData("text") ?? ""; if (!text.trim()) return;
      e.preventDefault(); setBigModal(false);
      start(async () => { const r = await bulkCreateStudents(text); if (r.error) metaAlert(r.error); else { metaAlert(`${r.created}명 등록되었습니다.`); load(); } });
    };
    document.addEventListener("paste", onPaste); return () => document.removeEventListener("paste", onPaste);
  }, []);
  // 원본 필터 블록(verbatim) 연결 — 검색어/학년/레벨/상태
  useEffect(() => {
    const root = document.querySelector(".listFilter-wrap"); if (!root) return;
    const sel = root.querySelector<HTMLSelectElement>(".search-select select");
    const inp = root.querySelector<HTMLInputElement>("#schVal");
    const btn = root.querySelector<HTMLButtonElement>(".search-input button");
    const picked = (name: string) => [...root.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)].map((i) => i.value).filter(Boolean);
    const apply = () => { setPage(1); setFlt({ field: sel?.value ?? "f_user_nm", kw: inp?.value ?? "", grades: picked("filtergrade"), levels: picked("chkLevelCd"), states: picked("chkStateCd") }); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") apply(); };
    const cleanup: (() => void)[] = [];
    inp?.addEventListener("keydown", onKey); cleanup.push(() => inp?.removeEventListener("keydown", onKey));
    btn?.addEventListener("click", apply); cleanup.push(() => btn?.removeEventListener("click", apply));
    root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((c) => {
      const h = () => {
        // 전체 체크박스는 같은 묶음 전체 토글 (원본 동작)
        const group = c.closest(".filter-check");
        if (["chkGradeAll", "fLv", "fStatus"].includes(c.name)) group?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((x) => { if (x !== c) x.checked = false; });
        else { const all = group?.querySelector<HTMLInputElement>('input[name="chkGradeAll"], input[name="fLv"], input[name="fStatus"]'); if (all) all.checked = false; }
        apply();
      };
      c.addEventListener("change", h); cleanup.push(() => c.removeEventListener("change", h));
    });
    // 필터 접기/펴기(원본 .fold-top 라벨 클릭)
    const foldLabel = root.querySelector(".fold-top .listFilter-title");
    const fold = () => root.classList.toggle("open");
    foldLabel?.addEventListener("click", fold); cleanup.push(() => foldLabel?.removeEventListener("click", fold));
    return () => cleanup.forEach((f) => f());
  }, []);

  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const onDelete = async () => {
    if (checked.size === 0) return;
    if (!(await metaConfirm(`선택한 ${checked.size}명을 삭제할까요?`))) return;
    start(async () => { await deleteStudents([...checked]); setChecked(new Set()); load(search); });
  };

  // 필터 적용(클라이언트) — 원본은 서버 조회지만 결과는 동일
  const filtered = rows.filter((r) => {
    if (flt.grades.length && !flt.grades.some((g) => GRADE_BY_CODE[g] === r.grade)) return false;
    if (flt.levels.length && !flt.levels.some((l) => LEVEL_BY_CODE[l] === (r.study_level ?? ""))) return false;
    if (flt.states.length && !flt.states.some((st) => STATE_BY_CODE[st] === r.state)) return false;
    const kw = flt.kw.trim();
    if (kw) {
      const hay = flt.field === "f_access_pw" ? (r.phone ?? "") : flt.field === "f_user_id" ? r.id : r.name;
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const pageRows = filtered.slice((page - 1) * size, page * size);
  const allChecked2 = pageRows.length > 0 && pageRows.every((r) => checked.has(r.id));

  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div dangerouslySetInnerHTML={{ __html: STUDENT_FILTER_HTML }} />
      <p className="alert-orange mt-24 mb-16">
        <a href="#" style={{ textDecoration: "underline" }} onClick={async (e) => { e.preventDefault(); await metaAlert("샘플파일 다운로드는 준비 중입니다."); }}> 샘플파일(액셀csv)다운로드</a> 후 양식에 맞게 입력하여 이 화면에서 ctrl+v 해주세요. </p>

      <div className="category-btns mt-24 mb-8">
        <div className="left-area">
          <button type="button" className="category-btns-item" onClick={async () => { if (checked.size === 0) { await metaAlert("학생을 선택해주세요."); return; } setBulkModal(true); }}>일괄 레벨/학적 상태 변경</button>
          <button type="button" className="category-btns-item" onClick={onDelete}>삭제</button>
        </div>
        <div className="right-area">
          <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => setBigModal(true)}>학생 대량 등록</button>
          <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => router.push("/management/studentform")}>학생 등록</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-default-list">
          <thead>
            <tr>
              <th><div className="form-check d-flex gap-1">
                <input type="checkbox" name="user" className="form-check-input" id="checkAll" checked={allChecked2}
                  onChange={(e) => setChecked(e.target.checked ? new Set(pageRows.map((r) => r.id)) : new Set())} />
                <label htmlFor="checkAll" className="form-check-label d-flex flex-column">학생명</label>
              </div></th>
              <th>학생번호</th><th>학생ID</th><th>학생 휴대폰</th><th>학부모 휴대폰</th><th>출결 번호</th><th>등록일</th>
              <th className="text-center">상세</th><th className="text-center">삭제</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                <td className="name text-left"><div className="form-check d-flex gap-1">
                  <input type="checkbox" name="chkStdList" className="form-check-input" id={`chkUid_${r.id}`} value={r.id}
                    checked={checked.has(r.id)} onChange={() => toggle(r.id)} />
                  <label htmlFor={`chkUid_${r.id}`} className="form-check-label d-flex flex-column">{r.name}
                    <span className="info">
                      <span>{BAND[(r.grade ?? "")[0]] ?? "기타"}</span>
                      <span>{GRADE_LABEL[r.grade] ?? r.grade}</span>
                      {r.study_level && <span>{r.study_level}</span>}
                      <span>{r.state === "paused" ? "예비" : r.state === "left" ? "휴회" : "정규"}</span>
                    </span>
                  </label>
                </div></td>
                <td>{r.id.slice(0, 8)}</td>
                <td></td>
                <td>{r.phone ?? ""}</td>
                <td>{r.parent_phone ?? ""}</td>
                <td></td>
                <td>{fmtD(r.created_at)}</td>
                <td className="text-center"><button type="button" className="button__fill button__line--xsmall button__line--white bw10" onClick={() => router.push(`/management/studentform?id=${r.id}`)}>보기</button></td>
                <td className="text-center"><button type="button" onClick={async () => { if (await metaConfirm("해당 학생을 삭제하시겠습니까? ")) start(async () => { await deleteStudents([r.id]); load(search); }); }}><span className="material-symbols-sharp f-20 bw6">delete</span></button></td>
              </tr>
            ))}
            {pageRows.length === 0 && <tr><td colSpan={9} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-16">
        <div className="d-flex align-items-center gap-2 f-14"> 총 {filtered.length}개 중 <div className="select__small">
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 30, 40, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select></div> 개씩 보기 </div>
        <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i><span>Scroll to Top</span></button>
        <div className="pagination"><div className="pagination__wrap">
          <a href="javascript:void(0);" className={`prev${page <= 1 ? " disabled" : ""}`} onClick={() => page > 1 && setPage(page - 1)}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <a key={n} href="javascript:void(0);" className={n === page ? "active" : ""} onClick={() => setPage(n)}>{n}</a>
          ))}
          <a href="javascript:void(0);" className={`${page >= totalPages ? "disabled " : ""}next`} onClick={() => page < totalPages && setPage(page + 1)}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
        </div></div>
      </div>

      {bulkModal && <BulkLevelModal ids={[...checked]} onClose={() => setBulkModal(false)} onDone={() => { setBulkModal(false); setChecked(new Set()); load(search); }} start={start} pending={pending} />}
      {bigModal && <BigRegisterModal onClose={() => setBigModal(false)} />}
    </div>
  );
}



/* 원본 student.cshtml 의 modalSetLevels 마크업 그대로 */
function BulkLevelModal({ ids, onClose, onDone, start, pending }: { ids: string[]; onClose: () => void; onDone: () => void; start: (fn: () => Promise<void>) => void; pending: boolean }) {
  const [level, setLevel] = useState(""); const [state, setState] = useState("");
  const apply = () => start(async () => { const r = await bulkUpdateStudents(ids, { study_level: level || undefined, state: state || undefined }); if (r.error) metaAlert(r.error); else onDone(); });
  return (
    <>
      <div className="modal fade modal-inner-scroll max-450 show" id="modalSetLevels" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">일괄 레벨/상태 변경</h6><button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body"><ul className="list-underline">
            <li className="d-flex justify-content-between"><span className="title">레벨</span>
              <div className="filter-radio">{LEVELS.map((l) => (<span key={l}><input type="radio" name="userStatusLevel" id={`userStatusLevel_${l}`} checked={level === l} onChange={() => setLevel(l)} /><label htmlFor={`userStatusLevel_${l}`}>{l}</label></span>))}</div></li>
            <li className="d-flex justify-content-between" style={{ borderBottom: 0 }}><span className="title">학적 상태</span>
              <div className="filter-radio">{STATES.map(([v, l]) => (<span key={v}><input type="radio" name="userStatus" id={`userStatusCd_${v}`} checked={state === v} onChange={() => setState(v)} /><label htmlFor={`userStatusCd_${v}`} className="w-100">{l}</label></span>))}</div></li>
          </ul></div>
          <div className="modal-footer">
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__line--small button__line--white button__weight--medium" onClick={onClose}>취소</button>
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__fill--small button__fill--secondary" onClick={apply} disabled={pending}>적용</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}

/* 원본 modalStdBigData(안내) 마크업 그대로 — 실제 등록은 화면에서 ctrl+v */
function BigRegisterModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="modal modal--xsmall max-400 fade show" id="modalStdBigData" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">학생 대량 등록</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button></div>
          <div className="modal-body text-center pl-40 pr-40"><p>엑셀파일에서 해당 영역을 복사 후 <br />이 화면에서 바로 ctrl+v를 해주세요.</p></div>
          <div className="modal-footer"><button type="button" className="submit" onClick={onClose}>확인</button></div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
