"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { SelectAllCheckbox } from "@/components/portal/SelectAllCheckbox";
import { fmtShort } from "@/lib/date";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import {
  listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeachers,
  checkDupLoginId, bulkUpdateTeacherPerms, type TeacherRow,
} from "./teacherActions";

/** 원본 teacher.cshtml arrForRenderList (메뉴별 사용권한) 그대로 */
const MENU_LIST: [string, string][] = [
  ["student", "학생관리"], ["sms", "홍보/문자 관리"], ["teacher", "교사관리"], ["group", "반관리"],
  ["center", "교실정보관리"], ["money", "수납관리"], ["cal", "정산관리"], ["paper", "문제지 관리"],
  ["allclass", "전체반보기 허용"], ["gradetree", "학년별보기 허용"], ["kmt", "전국학력평가"],
  ["metabookOrd", "교재주문관리"],
];
/** 원본 검색필터 "메뉴권한" 라디오 (id, value, label) 캡처 마크업 그대로 */
const PERM_FILTER: [string, string, string][] = [
  ["fGrade01", "", "전체"], ["fGrade02", "student", "학생"], ["fGrade03", "sms", "홍보/문자"],
  ["fGrade04", "teacher", "교사"], ["fGrade05", "group", "반"], ["fGrade06", "center", "교실"],
  ["fGrade07", "money", "수납"], ["fGrade08", "cal", "정산"], ["fGrade09", "paper", "문제지 관리"],
  ["fGrade10", "allclass", "전체 반 보기"], ["fGrade11", "gradetree", "학년별 보기"],
  ["fGrade12", "kmt", "전국학력평가"], ["fGrade13", "metabookOrd", "교재주문관리"],
];
const ID_RE = /^[a-z0-9]{4,12}$/;
const PW_RE = /^[a-zA-Z0-9]{4,12}$/;
const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 원본 등록일 표기 YY.MM.DD */
const shortDate = fmtShort;
/** 원본 paginationV2.js pageRange 기본값 */
const PAGE_RANGE = 5;

type Form = {
  id?: string; f_user_nm: string; p1: string; p2: string; p3: string;
  f_email: string; f_web_id: string; f_web_pw: string; f_web_pw2: string;
  f_access_menu: Record<string, boolean>; f_update_nm: string; f_update_time: string;
};
const emptyForm = (): Form => ({
  f_user_nm: "", p1: "", p2: "", p3: "", f_email: "", f_web_id: "", f_web_pw: "", f_web_pw2: "",
  f_access_menu: {}, f_update_nm: "", f_update_time: "",
});

export function TeacherClient() {
  const [view, setView] = useState<"list" | "reg" | "edit">("list");
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [key, setKey] = useState("f_user_nm");
  const [keyword, setKeyword] = useState("");
  const [perm, setPerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageView, setPageView] = useState(10);
  const [abilityModal, setAbilityModal] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm());
  const [dupOk, setDupOk] = useState(false);
  const [pending, start] = useTransition();

  const load = (o?: { key?: string; keyword?: string; perm?: string }) =>
    start(async () => setRows(await listTeachers({ key, keyword, perm, ...o })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const cnt = rows.length;
  /** 원본 paginationV2.js 와 동일: totalPages 는 0 이 될 수 있고 페이지 링크는 5개 묶음 */
  const totalPage = Math.ceil(cnt / pageView);
  const pageNums = (() => {
    const startIndex = (Math.ceil(page / PAGE_RANGE) - 1) * PAGE_RANGE + 1;
    const endIndex = startIndex + PAGE_RANGE > totalPage ? totalPage : startIndex + PAGE_RANGE - 1;
    const arr: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) if (i > 0 && i <= totalPage) arr.push(i);
    if (arr.length === 0) arr.push(1);
    return arr;
  })();
  /** 원본 prevPage/nextPage — 5개 묶음 단위 이동 */
  const goPrev = () => { const g = Math.ceil(page / PAGE_RANGE); if (page > PAGE_RANGE) setPage(g * PAGE_RANGE - PAGE_RANGE); };
  const goNext = () => { const g = Math.ceil(page / PAGE_RANGE); if (g < Math.ceil(totalPage / PAGE_RANGE)) setPage(g * PAGE_RANGE + 1); };
  const pageRows = rows.slice((page - 1) * pageView, page * pageView);
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const permView = (r: TeacherRow) => {
    if (r.role === "owner") return "전체";
    const on = MENU_LIST.filter(([k]) => r.access_menu[k]).map(([, l]) => l);
    return on.length === 0 ? "" : on.length === MENU_LIST.length ? "전체" : on.join(", ");
  };

  /** 원본 deleteMultiTeacher / doDeleteTeacher */
  const doDeleteTeacher = (ids: string[]) => {
    start(async () => {
      if (!(await metaConfirm("해당 교사를 삭제하시겠습니까? "))) return;
      const r = await deleteTeachers(ids);
      if (r.error) { await metaAlert(r.error); return; }
      setChecked(new Set());
      setRows(await listTeachers({ key, keyword, perm }));
    });
  };
  const deleteMultiTeacher = async () => {
    if (checked.size === 0) { await metaAlert("먼저 교사를 선택해주세요 "); return; }
    doDeleteTeacher([...checked]);
  };
  /** 원본 openModalIframe (changeteacherability.cshtml 레이어팝업) 대체 */
  const openModalIframe = async () => {
    if (checked.size === 0) { await metaAlert("먼저 목록에서 선택해주세요 "); return; }
    setAbilityModal(true);
  };

  const doDetail = () => { setForm(emptyForm()); setDupOk(false); setView("reg"); };
  const doDetailForEdit = (id: string) => start(async () => {
    const d = await getTeacher(id);
    if (!d) { await metaAlert("교사 정보를 불러오지 못했습니다."); return; }
    const p = (d.phone ?? "").replace(/[^0-9]/g, "");
    setForm({
      id: d.id, f_user_nm: d.name, p1: p.slice(0, 3), p2: p.slice(3, p.length - 4), p3: p.slice(-4),
      f_email: d.contact_email, f_web_id: d.login_id, f_web_pw: "", f_web_pw2: "",
      f_access_menu: d.access_menu, f_update_nm: d.updated_name, f_update_time: d.updated_at,
    });
    setDupOk(true); setView("edit");
  });
  const doList = () => { setView("list"); load(); };

  return (
    <>
      {/* 원본 teacher.cshtml 의 구버전 헤더 — style-new.css 의 `#contents .contents-header{display:none}` 로 숨겨진다 */}
      <div id="tempHeader" className="contents-header">
        <div className="contents-header__wrap">
          <div id="tempLeftHeader" className="left-area">
            <span className="material-symbols-sharp">manage_accounts</span>
            <h2>관리</h2>
          </div>
          <div id="leftHeaderForDetail" className="left-area contents-header__detail" style={{ display: "none" }}>
            <div className="bread-crumbs">
              <span>관리</span>
              <span>교사등록</span>
            </div>
            <a href="javascript:void(0)" className="back-btn" id="rrbackButton">
              <img src="/assets/center/images/common/back_header_icon.svg" alt="" />
            </a>
            <h2>돌아가기</h2>
          </div>
          <div className="right-area">
            <button type="button" className="button__line button__fill--medium button__fill--red">
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>
              문제지 만들기
            </button>
          </div>
        </div>
      </div>
      <div className="contens-body">
      {view === "list" && <ListTab tabs={MANAGEMENT_TABS} />}
      {/* 원본: 검색필터는 v-show 라 등록·수정 화면에서도 DOM 에 남아 숨겨진다 */}
      <div className="listFilter-wrap" style={view === "list" ? undefined : { display: "none" }}>
            <ul>
              <li>
                <label className="listFilter-title">검색어</label>
                <div className="listFilter-items">
                  <div className="search-select">
                    <div className="select__small">
                      <select value={key} onChange={(e) => setKey(e.target.value)}>
                        <option value="f_user_nm">교사명</option>
                        <option value="f_web_id">아이디</option>
                      </select>
                    </div>
                    <div className="search-input">
                      <input type="search" placeholder="검색어 입력" value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }} />
                      <button onClick={() => { setPage(1); load(); }}>검색</button>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <label className="listFilter-title">메뉴권한</label>
                <div className="listFilter-items">
                  <div className="filter-check">
                    {PERM_FILTER.map(([id, value, label]) => (
                      <Fragment key={id}>
                        <input type="radio" name="filtergrade" id={id} value={value} checked={perm === value}
                          onChange={() => { setPerm(value); setPage(1); load({ perm: value }); }} />
                        <label htmlFor={id}>{label}</label>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </li>
            </ul>
      </div>

      {view === "list" && (
        <>
          <div className="category-btns mt-24 mb-8">
            <div className="left-area">
              <button type="button" className="category-btns-item" onClick={openModalIframe}>일괄 사용권한 변경</button>
              <button type="button" className="category-btns-item" onClick={deleteMultiTeacher}>삭제</button>
            </div>
            <div className="right-area">
              <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doDetail}>교사 등록</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-default-list">
              <thead>
                <tr>
                  <th>
                    <div className="form-check d-flex gap-1">
                      <SelectAllCheckbox  name="user" className="form-check-input" id="checkAll"
                        
                         total={pageRows.length} allSelected={pageRows.every((r) => checked.has(r.id))} onToggle={(v) => setChecked(v ? new Set(pageRows.map((r) => r.id)) : new Set())} />
                      <label htmlFor="checkAll" className="form-check-label d-flex flex-column">교사명</label>
                    </div>
                  </th>
                  <th>아이디</th>
                  <th>휴대폰</th>
                  <th>메뉴권한</th>
                  <th>등록일</th>
                  <th className="text-center">관리</th>
                  <th className="text-center">삭제</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="name">
                      <div className="form-check d-flex gap-1">
                        <input type="checkbox" className="form-check-input selectChild" id={`user_${r.id}`} name="f_check"
                          value={r.id} checked={checked.has(r.id)} onChange={() => toggle(r.id)} />
                        <label htmlFor={`user_${r.id}`} className="form-check-label">{r.name}</label>
                      </div>
                    </td>
                    <td>{r.login_id}</td>
                    <td>{r.phone ?? ""}</td>
                    <td>{permView(r)}</td>
                    <td>{shortDate(r.created_at)}</td>
                    <td className="text-center">
                      <button type="button" onClick={() => doDetailForEdit(r.id)}><span className="material-symbols-sharp f-20 bw6">settings</span></button>
                    </td>
                    <td className="text-center">
                      <button type="button" onClick={() => doDeleteTeacher([r.id])}><span className="material-symbols-sharp f-20 bw6">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between mt-16">
            <div className="d-flex align-items-center gap-2 f-14">
              총 {cnt}개 중
              <div className="select__small">
                <select value={pageView} onChange={(e) => { setPageView(Number(e.target.value)); setPage(1); }}>
                  {[10, 20, 30, 40, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              개씩 보기
            </div>
            <button className="scrollToTop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <i className="fa-sharp fa-light fa-arrow-up-to-line" aria-hidden="true"></i><span>Scroll to Top</span>
            </button>
            <div className="pagination"><div className="pagination__wrap">
              <a href="javascript:void(0);" className={`prev${page === 1 ? " disabled" : ""}`} onClick={goPrev}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
              {pageNums.map((n) => (
                <a key={n} href="javascript:void(0);" className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</a>
              ))}
              <a href="javascript:void(0);" className={`${page === totalPage ? "disabled " : ""}next`} onClick={goNext}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
            </div></div>
          </div>
        </>
      )}

      {view !== "list" && (
        <TeacherDetailForm mode={view} form={form} setForm={setForm} dupOk={dupOk} setDupOk={setDupOk}
          pending={pending} start={start} onList={doList} />
      )}

      {abilityModal && (
        <AbilityModal ids={[...checked]} onClose={() => setAbilityModal(false)} pending={pending} start={start}
          onDone={() => { setAbilityModal(false); setChecked(new Set()); load(); }} />
      )}

      </div>

      {/* 원본: #tempGuideUI 는 .contens-body 형제로 #contents 바로 아래에 있다 */}
      <div id="tempGuideUI" className="alert alert-warning alert-dismissible fade show alert-fixed" role="alert" style={view === "list" ? undefined : { display: "none" }}>
        <span className="material-symbols-sharp">error</span>
        <div className="msg">목록의 체크박스를 선택하고 액션버튼을 눌러주세요.</div>
        <button id="defabtn0" type="button" className="btn-close"></button>
      </div>
    </>
  );
}

/** 원본 teacher.cshtml 의 detailShow / selectedDetailShowToEdit 영역 (.manegment > .row.permissions) */
function TeacherDetailForm({ mode, form, setForm, dupOk, setDupOk, pending, start, onList }: {
  mode: "reg" | "edit"; form: Form; setForm: (f: Form) => void; dupOk: boolean; setDupOk: (v: boolean) => void;
  pending: boolean; start: (fn: () => Promise<void>) => void; onList: () => void;
}) {
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v });
  const allOn = MENU_LIST.every(([k]) => form.f_access_menu[k]);
  const phone = [form.p1, form.p2, form.p3].join("-");
  /* 원본은 등록/수정 영역이 별도 마크업이라 id·name 이 다르다 */
  const phoneName = mode === "reg" ? "phonenumber" : "phonenumberonedit";
  const pid = (base: string) => (mode === "reg" ? base : `edit${base}`);
  const chkAllId = mode === "reg" ? "chk01" : "chkchkchk";
  const menuName = mode === "reg" ? "f_check_detail" : "f_check_edit";
  const menuId = (key: string, index: number) => (mode === "reg" ? `${index}userStatus01` : key);

  const doCheckDupWebID = () => {
    start(async () => {
      if (!ID_RE.test(form.f_web_id)) { await metaAlert("영어소문자, 숫자 4~12자리 조합으로 생성가능합니다."); return; }
      const { dup } = await checkDupLoginId(form.f_web_id);
      if (dup) { setDupOk(false); await metaAlert("이미 존재하는 아이디입니다. "); }
      else { setDupOk(true); await metaAlert("사용 가능한 아이디입니다. "); }
    });
  };

  const submit = () => {
    start(async () => {
      if (!form.f_user_nm.trim()) { await metaAlert("교사명을 입력하세요. "); return; }
      if (!form.p1 || !form.p2 || !form.p3) { await metaAlert("핸드폰 번호를 입력하세요. "); return; }
      if (!form.f_email.trim()) { await metaAlert("이메일를 입력하세요. "); return; }
      if (!MAIL_RE.test(form.f_email.trim())) { await metaAlert("유효한 이메일 형식이 아닙니다. "); return; }
      if (!form.f_web_id.trim()) { await metaAlert("아이디를 입력하세요. "); return; }
      if (!ID_RE.test(form.f_web_id)) { await metaAlert("아이디는 영어소문자,숫자 4~12자리여야합니다. "); return; }
      if (mode === "reg" && !form.f_web_pw) { await metaAlert("비밀번호를 입력하세요. "); return; }
      if (form.f_web_pw && !PW_RE.test(form.f_web_pw)) { await metaAlert("비밀번호는 영문,숫자 4~12자리여야합니다. "); return; }
      if (form.f_web_pw !== form.f_web_pw2) { await metaAlert("비밀번호가 일치하지 않습니다. "); return; }
      if (!dupOk) { await metaAlert("아이디 중복체크 해주세요. "); return; }
      const payload = {
        name: form.f_user_nm, login_id: form.f_web_id, phone, contact_email: form.f_email,
        access_menu: form.f_access_menu,
      };
      const r = mode === "reg"
        ? await createTeacher({ ...payload, password: form.f_web_pw })
        : await updateTeacher(form.id as string, { ...payload, password: form.f_web_pw || undefined });
      if (r.error) { await metaAlert(r.error); return; }
      await metaAlert("저장 완료");
      onList();
    });
  };

  const numOnly = (v: string, max: number) => v.replace(/[^0-9]/g, "").slice(0, max);

  return (
    <div className="manegment">
      <div className="row permissions">
        <div className="col-7">
          <div className="card">
            <h3 className="section-title">교사 정보<span className="text-help p300 f-12">*표시는 필수 입력사항입니다.</span></h3>
            <div className="templete templete-add">
              <div className="form-group">
                <label htmlFor="fromTel" className="form-label required">교사명</label>
                <input type="text" className="form-control" id="fromTel" placeholder="교사명을 입력해주세요."
                  value={form.f_user_nm} onChange={(e) => set("f_user_nm", e.target.value)} />
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              <div className="form-group">
                <label className="form-label required">휴대폰</label>
                {/* 원본: 등록은 name=phonenumber/#stphone…, 수정은 name=phonenumberonedit/#editstphone… */}
                <div className="d-flex gap-1">
                  <input type="number" name={phoneName} className="form-control" id={pid("stphone")} value={form.p1} onChange={(e) => set("p1", numOnly(e.target.value, 3))} />
                  <span className="d-flex align-items-center">-</span>
                  <input type="number" name={phoneName} className="form-control" id={pid("midphone")} value={form.p2} onChange={(e) => set("p2", numOnly(e.target.value, 4))} />
                  <span className="d-flex align-items-center">-</span>
                  <input type="number" name={phoneName} className="form-control" id={pid("lastphone")} value={form.p3} onChange={(e) => set("p3", numOnly(e.target.value, 4))} />
                </div>
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmail" className="form-label required">이메일</label>
                <input type="email" className="form-control" id="inputEmail" placeholder="meta@email.com"
                  value={form.f_email} onChange={(e) => set("f_email", e.target.value)} />
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              <div className="form-group">
                <label htmlFor="inputID" className="form-label required">아이디</label>
                <div className="input-group gap-1">
                  {/* 원본 수정화면 placeholder 는 오타("엉어소문자")라 등록화면 문구로 통일 */}
                  <input type="tel" className="form-control" id="inputID" placeholder="영어소문자, 숫자 4~12자리"
                    value={form.f_web_id} onChange={(e) => { setDupOk(false); set("f_web_id", e.target.value); }} />
                  <button type="button" className="btn btn-default" onClick={doCheckDupWebID}>중복체크</button>
                </div>
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              <div className="form-group">
                <label htmlFor="inputPW" className={mode === "reg" ? "form-label required" : "form-label"}>비밀번호</label>
                <input type="password" className="form-control" id="inputPW" placeholder="영문, 숫자 4~12자리"
                  value={form.f_web_pw} onChange={(e) => set("f_web_pw", e.target.value)} />
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              <div className="form-group">
                <label htmlFor="inputPWcheck" className={mode === "reg" ? "form-label required" : "form-label"}>비밀번호 확인</label>
                <input type="password" className="form-control" id="inputPWcheck" placeholder="영문, 숫자 4~12자리"
                  value={form.f_web_pw2} onChange={(e) => set("f_web_pw2", e.target.value)} />
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
              {mode === "edit" && (
                <>
                  <div className="form-group">
                    <label htmlFor="authorName" className="form-label">최종 수정자</label>
                    <input type="text" className="form-control" id="authorName" disabled value={form.f_update_nm} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addTime" className="form-label">수정일시</label>
                    <input type="text" className="form-control" id="addTime" disabled value={form.f_update_time} readOnly />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-5">
          <div className="card h-100">
            <h3 className="section-title">메뉴별 사용권한</h3>
            <div className="templete templete-add h-100">
              <div className="d-flex justify-content-between">
                <div className="form-check">
                  <input type="checkbox" name="user" className="form-check-input" id={chkAllId} checked={allOn}
                    onChange={(e) => set("f_access_menu", e.target.checked ? Object.fromEntries(MENU_LIST.map(([k]) => [k, true])) : {})} />
                  <label htmlFor={chkAllId} className="form-check-label d-flex flex-column">전체선택</label>
                </div>
                <span className="text-help s300 f-12">체크한 메뉴만 사용 권한을 부여합니다.</span>
              </div>
              <ul className="permissions-list">
                {MENU_LIST.map(([k, name], index) => (
                  <li key={k}>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id={menuId(k, index)} name={menuName}
                        checked={!!form.f_access_menu[k]}
                        onChange={(e) => set("f_access_menu", { ...form.f_access_menu, [k]: e.target.checked })} />
                      <label className="form-check-label d-flex flex-column" htmlFor={menuId(k, index)}>{name}</label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex mt-16 justify-content-between">
        <button type="button" className="button__fill button__line--small button__line--white" onClick={onList}>목록으로</button>
        <button type="button" className="button__fill--blue button__line--small" onClick={submit} disabled={pending}>
          <span className="material-symbols-sharp">done</span>
          저장하기
        </button>
      </div>
    </div>
  );
}

/** 원본 "일괄 사용권한 변경" 레이어팝업(changeteacherability.cshtml) 대체 모달 — 원본 모달 마크업 구조 사용 */
function AbilityModal({ ids, onClose, onDone, pending, start }: {
  ids: string[]; onClose: () => void; onDone: () => void; pending: boolean; start: (fn: () => Promise<void>) => void;
}) {
  const [menu, setMenu] = useState<Record<string, boolean>>({});
  const allOn = MENU_LIST.every(([k]) => menu[k]);
  const apply = () => start(async () => {
    const r = await bulkUpdateTeacherPerms(ids, menu);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장 완료");
    onDone();
  });
  return (
    <>
      <div className="modal fade modal-inner-scroll max-360 show" id="modalTeacherAbility" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header">
            <h6 className="f-14">일괄 사용권한 변경</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button>
          </div>
          <div className="modal-body pt-8 pb-28">
            <div className="d-flex justify-content-between">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="chkAbilityAll" checked={allOn}
                  onChange={(e) => setMenu(e.target.checked ? Object.fromEntries(MENU_LIST.map(([k]) => [k, true])) : {})} />
                <label htmlFor="chkAbilityAll" className="form-check-label d-flex flex-column">전체선택</label>
              </div>
              <span className="text-help s300 f-12">체크한 메뉴만 사용 권한을 부여합니다.</span>
            </div>
            <ul className="permissions-list">
              {MENU_LIST.map(([k, name]) => (
                <li key={k}>
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id={`ability_${k}`} checked={!!menu[k]}
                      onChange={(e) => setMenu({ ...menu, [k]: e.target.checked })} />
                    <label className="form-check-label d-flex flex-column" htmlFor={`ability_${k}`}>{name}</label>
                  </div>
                </li>
              ))}
            </ul>
            <ul className="explain-list bw6 mt-16"><li>선택한 {ids.length}명의 교사에게 위 사용권한이 그대로 적용됩니다.</li></ul>
          </div>
          <div className="modal-footer">
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__line--small button__line--white button__weight--medium" onClick={onClose}>취소</button>
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__fill--small button__fill--secondary" onClick={apply} disabled={pending}>확인</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
