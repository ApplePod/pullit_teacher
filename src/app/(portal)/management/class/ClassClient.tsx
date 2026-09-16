"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { fmtShort } from "@/lib/date";
import { useRouter } from "next/navigation";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
import {
  listClasses, listTeacherOptions, getClassDetail, createClassGroup, updateClassGroup, deleteClasses,
  listClassStudents, listAssignableStudents, addStudentsToClass, removeStudentsFromClass, moveStudentsToClass,
  type ClassRow, type ClassSchedule, type ClassStudentRow,
} from "./classActions";
import { listClassTextbooks, removeClassTextbooks, type MappingBook } from "../book/bookActions";

/** 원본 _CODE4CD('GR') — [원본코드, 라벨, DB 코드] */
const GR: [string, string, string][] = [
  ["GRE0", "예비초", "e0"], ["GRE1", "초1", "e1"], ["GRE2", "초2", "e2"], ["GRE3", "초3", "e3"],
  ["GRE4", "초4", "e4"], ["GRE5", "초5", "e5"], ["GRE6", "초6", "e6"],
  ["GRM1", "중1", "m1"], ["GRM2", "중2", "m2"], ["GRM3", "중3", "m3"],
  ["GRH1", "고1", "h1"], ["GRH2", "고2", "h2"], ["GRH3", "고3", "h3"], ["GR99", "기타", "etc"],
];
const WEEKS: [string, string][] = [["1", "월요일"], ["2", "화요일"], ["3", "수요일"], ["4", "목요일"], ["5", "금요일"], ["6", "토요일"], ["7", "일요일"]];
const HH = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MM = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const STATE_NM: Record<string, string> = { active: "정규", paused: "휴회", left: "퇴원" };
const stepNm = (g: string) => (g.startsWith("e") ? "초등" : g.startsWith("m") ? "중등" : g.startsWith("h") ? "고등" : g === "n" ? "N수" : "기타");
const gradeNo = (g: string) => (/^[emh]\d$/.test(g) ? `${g[1]}학년` : GRADE_LABEL[g] ?? g);
const shortDate = fmtShort;
/** 원본 paginationV2.js pageRange 기본값 */
const PAGE_RANGE = 5;

type Detail = {
  id?: string; f_group_nm: string; f_grade_cd: string; f_start_dt: string; f_room: string;
  teacher_id: string; f_memo: string; f_schedule_info: (ClassSchedule & { tempId: number })[];
  f_reg_nm: string; f_update_dt: string;
};
const emptyDetail = (): Detail => ({ f_group_nm: "", f_grade_cd: "", f_start_dt: "", f_room: "", teacher_id: "", f_memo: "", f_schedule_info: [], f_reg_nm: "", f_update_dt: "" });

export function ClassClient() {
  const router = useRouter();
  const [view, setView] = useState<"list" | "reg" | "edit">("list");
  const [tab, setTab] = useState<"group" | "student">("group");
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [key, setKey] = useState("f_group_nm");
  const [keyword, setKeyword] = useState("");
  const [grades, setGrades] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageView, setPageView] = useState(10);
  const [detail, setDetail] = useState<Detail>(emptyDetail());
  const [students, setStudents] = useState<ClassStudentRow[]>([]);
  const [stdChecked, setStdChecked] = useState<Set<string>>(new Set());
  const [books, setBooks] = useState<MappingBook[]>([]);
  const [bookChecked, setBookChecked] = useState<Set<string>>(new Set());
  const [addModal, setAddModal] = useState(false);
  const [moveModal, setMoveModal] = useState<{ ids: string[] } | null>(null);
  const [pending, start] = useTransition();

  const load = (o?: { key?: string; keyword?: string; grades?: string[] }) =>
    start(async () => { setRows(await listClasses({ key, keyword, grades, ...o })); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); start(async () => setTeachers(await listTeacherOptions())); }, []);

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
  const toggleStd = (id: string) => setStdChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleBook = (id: string) => setBookChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  /** 원본 doDeleteGroup — "삭제된 항목은 복구할 수 없습니다. 삭제하시겠습니까? " */
  const doDeleteGroup = (ids: string[]) => start(async () => {
    if (!(await metaConfirm("삭제된 항목은 복구할 수 없습니다. 삭제하시겠습니까? "))) return;
    const r = await deleteClasses(ids);
    if (r.error) { await metaAlert(r.error); return; }
    setChecked(new Set());
    setRows(await listClasses({ key, keyword, grades }));
  });
  const doPreDeleteGroups = async () => {
    if (checked.size === 0) { await metaAlert("먼저 반을 선택해주세요 "); return; }
    doDeleteGroup([...checked]);
  };

  const doDetail = () => { setDetail(emptyDetail()); setStudents([]); setBooks([]); setBookChecked(new Set()); setTab("group"); setView("reg"); };
  const openEdit = (id: string, which: "group" | "student") => start(async () => {
    const d = await getClassDetail(id);
    if (!d) { await metaAlert("반 정보를 불러오지 못했습니다."); return; }
    const row = rows.find((r) => r.id === id);
    setDetail({
      id: d.id, f_group_nm: d.name, f_grade_cd: d.grade ?? "", f_start_dt: d.start_date ?? "",
      f_room: d.room ?? "", teacher_id: d.teacher_id ?? "", f_memo: d.memo ?? "",
      f_schedule_info: (d.schedule ?? []).map((s, i) => ({ ...s, tempId: i })),
      f_reg_nm: row?.reg_name ?? "", f_update_dt: row ? shortDate(row.created_at) : "",
    });
    setStudents(await listClassStudents(id));
    setBooks(await listClassTextbooks(id));
    setBookChecked(new Set());
    setStdChecked(new Set());
    setTab(which); setView("edit");
  });

  /** 원본 사용교재 블록 — doRemoveBooks / doRemoveOneBook / doSetTextbooks */
  const removeBooks = (ids: string[]) => start(async () => {
    const r = await removeClassTextbooks(detail.id as string, ids);
    if (r.error) { await metaAlert(r.error); return; }
    setBooks(await listClassTextbooks(detail.id as string));
    setBookChecked(new Set());
  });
  const doRemoveBooks = async () => {
    if (bookChecked.size === 0) { await metaAlert("먼저 목록에서 선택해주세요 "); return; }
    removeBooks([...bookChecked]);
  };
  const doRemoveOneBook = (id: string) => removeBooks([id]);
  const doSetTextbooks = () =>
    router.push(`/management/book/mapping?gid=${detail.id}&reqKind=group&gNm=${encodeURIComponent(detail.f_group_nm)}`);
  const doList = () => { setView("list"); setStdChecked(new Set()); load(); };

  const reloadStudents = () => start(async () => { setStudents(await listClassStudents(detail.id as string)); setStdChecked(new Set()); });

  const submitDetail = () => start(async () => {
    if (!detail.f_group_nm.trim()) { await metaAlert("반 이름을 입력해주세요. "); return; }
    if (!detail.f_grade_cd) { await metaAlert("학년을 선택해주세요. "); return; }
    const seen = new Set<string>();
    for (const s of detail.f_schedule_info) {
      const k = `${s.week}-${s.start_hh}${s.start_mm}`;
      if (seen.has(k)) { await metaAlert(" 시간표중 요일+시작시간분 중복데이터가 존재합니다."); return; }
      seen.add(k);
    }
    const payload = {
      name: detail.f_group_nm, grade: detail.f_grade_cd, start_date: detail.f_start_dt || undefined,
      room: detail.f_room, teacher_id: detail.teacher_id, memo: detail.f_memo,
      schedule: detail.f_schedule_info.map(({ week, start_hh, start_mm, end_hh, end_mm }) => ({ week, start_hh, start_mm, end_hh, end_mm })),
    };
    const r = view === "reg" ? await createClassGroup(payload) : await updateClassGroup(detail.id as string, payload);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장 완료");
    doList();
  });

  /** 원본 doRemoveStudentsInGroup */
  const doRemoveStudentsInGroup = () => start(async () => {
    if (stdChecked.size === 0) { await metaAlert("먼저 학생을 선택해주세요. "); return; }
    if (!(await metaConfirm("선택한 학생을 반에서 제외하시겠습니까? "))) return;
    const r = await removeStudentsFromClass(detail.id as string, [...stdChecked]);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("반에서 제외되었습니다. ");
    setStudents(await listClassStudents(detail.id as string));
    setStdChecked(new Set());
  });
  /** 원본 openMoveStudentsModalIframe */
  const openMoveStudentsModalIframe = async () => {
    if (stdChecked.size === 0) { await metaAlert("먼저 목록에서 선택해주세요 "); return; }
    setMoveModal({ ids: [...stdChecked] });
  };

  /** 원본 수정화면 탭 (v-show) — 목록·등록 화면에서는 display:none 으로 DOM 에 남는다 */
  const editTabs = (
    <ul className="list-tab mb-24" role="tablist" style={view === "edit" ? undefined : { display: "none" }}>
      <li className="nav-item" role="presentation">
        <button id="buttonforgroup" className={`nav-link${tab === "group" && view === "edit" ? " active" : ""}`} data-bs-toggle="tab" data-bs-target="#tab-pane-3"
          type="button" role="tab" aria-selected={tab === "group"} onClick={() => setTab("group")}>반 정보</button>
      </li>
      <li className="nav-item" role="presentation">
        <button id="buttonforstudentingroup" className={`nav-link${tab === "student" && view === "edit" ? " active" : ""}`} data-bs-toggle="tab" data-bs-target="#tab-pane-4"
          type="button" role="tab" aria-selected={tab === "student"} tabIndex={tab === "student" ? undefined : -1}
          onClick={() => setTab("student")}>반 학생 정보</button>
      </li>
    </ul>
  );

  return (
    <>
      {/* 원본 class.cshtml 의 구버전 헤더— style-new.css 의 `#contents .contents-header{display:none}` 로 숨겨진다 */}
      <div className="contents-header">
        <div className="contents-header__wrap">
          <div id="tempLeftHeader" className="left-area">
            <span className="material-symbols-sharp">manage_accounts</span>
            <h2>관리</h2>
          </div>
          <div id="leftHeaderForDetail" className="left-area contents-header__detail mt-20" style={{ display: "none" }}>
            <div className="bread-crumbs">
              <span>관리</span>
              <span>반 편성</span>
            </div>
            <a href="javascript:void(0);" className="back-btn">
              <img id="rrbackButton" src="/assets/center/images/common/back_header_icon.svg" alt="" />
            </a>
            <h2>
              <span id="fortitle" className="s300 fw-700"></span>
              반 편성하기
            </h2>
          </div>
          <div className="right-area">
            <button type="button" className="button__line button__fill--medium button__fill--red">
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>
              문제지 만들기
            </button>
          </div>
        </div>
      </div>
      <div className="contens-body" id="contapp">
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
                        <option value="f_group_nm">반명</option>
                        <option value="f_user_nm">등록자명</option>
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
                <label className="listFilter-title">필터</label>
                <div className="listFilter-items">
                  <div className="filter-check">
                    <input type="checkbox" id="allfGrade" checked={grades.length === GR.length}
                      onChange={(e) => { const g = e.target.checked ? GR.map(([, , db]) => db) : []; setGrades(g); setPage(1); load({ grades: g }); }} />
                    <label htmlFor="allfGrade">전체</label>
                    {GR.map(([code, nm, db]) => (
                      <Fragment key={code}>
                        <input type="checkbox" id={`fGrade${code}`} value={code} checked={grades.includes(db)}
                          onChange={(e) => { const g = e.target.checked ? [...grades, db] : grades.filter((x) => x !== db); setGrades(g); setPage(1); load({ grades: g }); }} />
                        <label htmlFor={`fGrade${code}`}>{nm}</label>
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
              <button type="button" className="category-btns-item" onClick={doPreDeleteGroups}>삭제</button>
            </div>
            <div className="right-area">
              <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doDetail}>반 등록</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-default-list">
              <thead>
                <tr>
                  <th>
                    <div className="form-check d-flex gap-1">
                      <input type="checkbox" name="user" className="form-check-input" id="checkAll"
                        checked={pageRows.length > 0 && pageRows.every((r) => checked.has(r.id))}
                        onChange={(e) => setChecked(e.target.checked ? new Set(pageRows.map((r) => r.id)) : new Set())} />
                      <label htmlFor="checkAll" className="form-check-label">반 명</label>
                    </div>
                  </th>
                  <th>학년</th>
                  <th>학생 수</th>
                  <th>등록자</th>
                  <th>등록일</th>
                  <th>메모</th>
                  <th className="text-center">반 학생</th>
                  <th className="text-center">상세</th>
                  <th className="text-center">삭제</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="name">
                      <div className="form-check d-flex gap-1">
                        <input type="checkbox" name="f_check" className="form-check-input" id={`user01${r.id}`} value={r.id}
                          checked={checked.has(r.id)} onChange={() => toggle(r.id)} />
                        <label htmlFor={`user01${r.id}`} className="form-check-label">{r.name}</label>
                      </div>
                    </td>
                    <td>{r.grade ? GRADE_LABEL[r.grade] ?? r.grade : ""}</td>
                    <td>{r.student_count}명</td>
                    <td>{r.reg_name ?? ""}</td>
                    <td>{shortDate(r.created_at)}</td>
                    <td>{r.memo ?? ""}</td>
                    <td className="text-center">
                      <button type="button" onClick={() => openEdit(r.id, "student")}><span className="material-symbols-sharp f-20 bw6">preview</span></button>
                    </td>
                    <td className="text-center">
                      <button type="button" onClick={() => openEdit(r.id, "group")}><span className="material-symbols-sharp f-20 bw6">preview</span></button>
                    </td>
                    <td className="text-center">
                      <button type="button" onClick={() => doDeleteGroup([r.id])}><span className="material-symbols-sharp f-20 bw6">delete</span></button>
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

      {/* 원본: 등록 탭(v-if) 과 수정 탭(v-show — 목록·등록 화면에서도 DOM 에 남아 숨겨진다) 마크업이 서로 다르다 */}
      {view === "reg" && (
        <ul className="list-tab mb-24" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-pane-1" type="button" role="tab" aria-selected="true">반 정보</button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={async () => { await metaAlert("반을 먼저 등록해주세요. "); }}>반 학생 정보</button>
          </li>
        </ul>
      )}
      {view === "edit" && editTabs}

      {view !== "list" && (
        <>
          <div className="tab-content" id="myTabContent">
            {/* 원본: 등록은 #tab-pane-1, 수정은 #tabcontforgroup (수정 화면은 두 탭 패널이 모두 DOM 에 있다) */}
            <div className={view === "reg" ? "tab-pane fade show active" : `tab-pane fade show${tab === "group" ? " active" : ""}`}
              id={view === "reg" ? "tab-pane-1" : "tabcontforgroup"} role="tabpanel" tabIndex={0}>
                <div className="manegment">
                  <div className="templete templete-add">
                    <p className="p300 mb-24 f-12">*표시는 필수 입력사항입니다.</p>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="className" className="form-label f-14 required">반명</label>
                          <input type="text" className="form-control" id="className" placeholder="반명을 입력해주세요."
                            {...(view === "reg" ? { maxLength: 50 } : {})}
                            value={detail.f_group_nm} onChange={(e) => setDetail({ ...detail, f_group_nm: e.target.value })} />
                          <div className="invalid-feedback">{"{HELP TEXT}"}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <div className="form-group">
                            <label htmlFor="tClass01" className="form-label f-14 required">학년</label>
                            <div className="filter-radio w-100">
                              {GR.map(([code, nm, db]) => (
                                <Fragment key={code}>
                                  <input type="radio" id={`ttGrade${code}`} name="tClass" value={code} checked={detail.f_grade_cd === db}
                                    onChange={() => setDetail({ ...detail, f_grade_cd: db })} />
                                  <label htmlFor={`ttGrade${code}`}>{nm}</label>
                                </Fragment>
                              ))}
                            </div>
                            <div className="invalid-feedback">{"{HELP TEXT}"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="openDate" className="form-label f-14">개강일</label>
                          {/* 원본 jq-date-picker 컴포넌트가 렌더하는 마크업 그대로 */}
                          <div className="daterange-single">
                            <div className="duration">
                              <div className="position-relative">
                                <input type="text" id="openDate" className="singleDate" placeholder="날짜"
                                  value={detail.f_start_dt} onChange={(e) => setDetail({ ...detail, f_start_dt: e.target.value })} />
                                <i className="fa-sharp fa-regular fa-calendar" aria-hidden="true" style={{ zIndex: 1, cursor: "pointer" }}></i>
                              </div>
                            </div>
                          </div>
                          <div className="invalid-feedback">{"{HELP TEXT}"}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="roomNum" className="form-label f-14">강의실</label>
                          <input type="text" className="form-control" id="roomNum" placeholder="수업하시는 강의실명을 입력해주세요."
                            value={detail.f_room} onChange={(e) => setDetail({ ...detail, f_room: e.target.value })} />
                          <div className="invalid-feedback">{"{HELP TEXT}"}</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="tName01" className="form-label f-14">담당교사</label>
                          <div className="filter-check w-100">
                            {teachers.map((t) => (
                              <Fragment key={t.id}>
                                <input type="checkbox" id={t.id} value={t.id} checked={detail.teacher_id === t.id}
                                  onChange={(e) => setDetail({ ...detail, teacher_id: e.target.checked ? t.id : "" })} />
                                <label htmlFor={t.id}>{t.name}</label>
                              </Fragment>
                            ))}
                          </div>
                          <div className="invalid-feedback">{"{HELP TEXT}"}</div>
                        </div>
                      </div>

                      {/* 원본: 사용교재 블록은 수정(selectedDetailShowToEdit) 화면에만 있다 */}
                      {view === "edit" && (
                        <div className="col-12">
                          <h4 className="fw-700 f-16">사용교재</h4>
                          <h4 className="d-flex justify-content-between mt-16 ">
                            <span className="fw-700"> 총 <span className="s300">{books.length}</span>개</span>
                            <span className="d-flex gap-1">
                              <button type="button" className="button__fill button__line--xsmall button__line--white" onClick={doRemoveBooks}>삭제</button>
                              <button type="button" className="button__fill--red button__line--xsmall" onClick={doSetTextbooks}><span className="material-symbols-sharp f-20">add</span> 교재 추가</button>
                            </span>
                          </h4>
                          <div className="use-book">
                            <table className="table table-default-list header-gray">
                              <thead>
                                <tr>
                                  <th>
                                    <div className="form-check d-flex gap-1">
                                      <input type="checkbox" name="checkAllpaperbooks" className="form-check-input" id="checkAll"
                                        checked={books.length > 0 && bookChecked.size === books.length}
                                        onChange={(e) => setBookChecked(e.target.checked ? new Set(books.map((b) => b.id)) : new Set())} />
                                      <label htmlFor="checkAll" className="form-check-label">교재명</label>
                                    </div>
                                  </th>
                                  <th>학년 학기</th>
                                  <th>교육과정</th>
                                  <th>출판사</th>
                                  <th>삭제</th>
                                </tr>
                              </thead>
                              <tbody>
                                {books.map((b) => (
                                  <tr key={b.id}>
                                    <td>
                                      <div className="form-check d-flex gap-1">
                                        <input type="checkbox" className="form-check-input" id={`book0${b.id}`} name="f_selected_books" value={b.id}
                                          checked={bookChecked.has(b.id)} onChange={() => toggleBook(b.id)} />
                                        <label htmlFor={`book0${b.id}`} className="form-check-label">{b.name}</label>
                                      </div>
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td>{b.publisher ?? ""}</td>
                                    <td>
                                      <button onClick={() => doRemoveOneBook(b.id)}><span className="material-symbols-sharp f-20">delete</span></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <p className="alert-orange">목록의 체크박스를 선택하고 액션버튼(교재 추가, 삭제)을 눌러주세요.</p>
                          </div>
                        </div>
                      )}

                      <div className="col-12 mb-24">
                        <ul className="list-tab" role="tablist">
                          <li className="nav-item pt-16"><label className="form-label f-14">시간표</label></li>
                          <li className="nav-item align-items-center mt-8 mb-8" style={{ marginLeft: "auto" }}>
                            <button type="button" className="button__fill--red button__line--xsmall"
                              onClick={() => setDetail({ ...detail, f_schedule_info: [...detail.f_schedule_info, { week: "1", start_hh: "00", start_mm: "00", end_hh: "00", end_mm: "00", tempId: Date.now() }] })}>시간추가</button>
                          </li>
                        </ul>
                        <ul className="week-table">
                          {detail.f_schedule_info.map((t, i) => {
                            const upd = (patch: Partial<ClassSchedule>) => {
                              const arr = [...detail.f_schedule_info]; arr[i] = { ...arr[i], ...patch };
                              setDetail({ ...detail, f_schedule_info: arr });
                            };
                            return (
                              <li key={t.tempId}>
                                <div className="day">
                                  <div className="select__medium">
                                    <select value={t.week} onChange={(e) => upd({ week: e.target.value })}>
                                      {WEEKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="time">
                                  <div className="start">
                                    <div className="select__medium"><select value={t.start_hh} onChange={(e) => upd({ start_hh: e.target.value })}>{HH.map((h) => <option key={h} value={h}>{h}시</option>)}</select></div>
                                    <div className="select__medium"><select value={t.start_mm} onChange={(e) => upd({ start_mm: e.target.value })}>{MM.map((m) => <option key={m} value={m}>{m}분</option>)}</select></div>
                                  </div>
                                  <span>-</span>
                                  <div className="end">
                                    <div className="select__medium"><select value={t.end_hh} onChange={(e) => upd({ end_hh: e.target.value })}>{HH.map((h) => <option key={h} value={h}>{h}시</option>)}</select></div>
                                    <div className="select__medium"><select value={t.end_mm} onChange={(e) => upd({ end_mm: e.target.value })}>{MM.map((m) => <option key={m} value={m}>{m}분</option>)}</select></div>
                                  </div>
                                </div>
                                <div className="actions">
                                  <button type="button" className="button__fill button__line--small button__line--white"
                                    onClick={() => setDetail({ ...detail, f_schedule_info: detail.f_schedule_info.filter((x) => x.tempId !== t.tempId) })}>삭제</button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <p className="alert-orange">24시간제(00~23시, 00~59분)로 작성해주세요. 배치순서: 요일순, 시작시간, 끝나는 시간 순</p>
                      </div>

                      {/* 원본: 최종 수정자·수정일자도 수정 화면에만 있다 */}
                      {view === "edit" && (
                        <>
                          <div className="col-6">
                            <div className="form-group">
                              <label htmlFor="authorName" className="form-label f-14">최종 수정자</label>
                              <input type="text" className="form-control" id="authorName" value={detail.f_reg_nm} disabled readOnly />
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="form-group">
                              <label htmlFor="addTime" className="form-label f-14">최종 수정일자</label>
                              <input type="text" className="form-control" id="addTime" value={detail.f_update_dt} disabled readOnly />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="col-12">
                        <div className="form-group">
                          <label htmlFor="floatingTextarea2" className="form-label f-14">메모</label>
                          <textarea className="form-control" placeholder="특이사항을 메모로 기록해주세요. (최대 100자)" id="floatingTextarea2"
                            style={{ height: 100 }} maxLength={100} value={detail.f_memo} onChange={(e) => setDetail({ ...detail, f_memo: e.target.value })}></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex mt-16 justify-content-between">
                    <button type="button" className="button__fill button__line--small button__line--white" onClick={doList}>목록으로</button>
                    <button type="button" className="button__fill--blue button__line--small" onClick={submitDetail} disabled={pending}>
                      <span className="material-symbols-sharp">done</span>
                      저장하기
                    </button>
                  </div>
                </div>
            </div>

            {view === "edit" && (
              <div id="tabcontforstudentingroup" className={`tab-pane fade show${tab === "student" ? " active" : ""}`} role="tabpanel" tabIndex={0}>
                <h4 className="f-16 fw-700 mb-16"><span className="s300 fw-700">{detail.f_group_nm}</span>반 학생 정보</h4>
                <div className="category-btns mt-24 mb-8">
                  <div className="left-area">
                    <button type="button" className="category-btns-item" onClick={openMoveStudentsModalIframe}>반 이동</button>
                    <button type="button" className="category-btns-item" onClick={doRemoveStudentsInGroup}>제외</button>
                  </div>
                  <div className="right-area">
                    <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => setAddModal(true)}>
                      <span className="material-symbols-sharp f-20">add</span>
                      학생 추가
                    </button>
                  </div>
                </div>
                <div className="use-book">
                  <table className="table table-default-list">
                    <thead>
                      <tr>
                        <th>
                          <div className="form-check d-flex gap-1">
                            <input type="checkbox" name="user12" className="form-check-input" id="checkAll02"
                              checked={students.length > 0 && stdChecked.size === students.length}
                              onChange={(e) => setStdChecked(e.target.checked ? new Set(students.map((s) => s.id)) : new Set())} />
                            <label htmlFor="checkAll02" className="form-check-label">학생 명</label>
                          </div>
                        </th>
                        <th>단계</th>
                        <th>학년</th>
                        <th>레벨</th>
                        <th>학적상태</th>
                        <th>학생정보</th>
                        <th>반 이동</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div className="form-check d-flex gap-1">
                              <input type="checkbox" name="f_check_student" className="form-check-input" id={`ins01${s.id}`} value={s.id}
                                checked={stdChecked.has(s.id)} onChange={() => toggleStd(s.id)} />
                              <label htmlFor={`ins01${s.id}`} className="form-check-label">{s.name}</label>
                            </div>
                          </td>
                          <td>{stepNm(s.grade)}</td>
                          <td>{gradeNo(s.grade)}</td>
                          <td>{s.study_level ?? ""}</td>
                          <td>{STATE_NM[s.state] ?? s.state}</td>
                          <td><button type="button" className="button__fill button__line--xsmall button__line--white" onClick={() => router.push(`/management/studentform?id=${s.id}`)}>보기</button></td>
                          <td><button type="button" className="button__fill button__line--xsmall button__line--white" onClick={() => setMoveModal({ ids: [s.id] })}>이동</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex mt-16 justify-content-between">
                  <button type="button" className="button__fill button__line--small button__line--white" onClick={doList}>목록으로</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {view !== "edit" && editTabs}

      {addModal && detail.id && (
        <AddStudentModal classId={detail.id} onClose={() => setAddModal(false)} pending={pending} start={start}
          onDone={() => { setAddModal(false); reloadStudents(); }} />
      )}
      {moveModal && detail.id && (
        <MoveStudentModal fromId={detail.id} ids={moveModal.ids} classes={rows.filter((r) => r.id !== detail.id)}
          onClose={() => setMoveModal(null)} pending={pending} start={start}
          onDone={() => { setMoveModal(null); reloadStudents(); }} />
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

/** 원본 allstudentsiframeforadd.cshtml(학생 추가 레이어팝업) 대체 */
function AddStudentModal({ classId, onClose, onDone, pending, start }: {
  classId: string; onClose: () => void; onDone: () => void; pending: boolean; start: (fn: () => Promise<void>) => void;
}) {
  const [list, setList] = useState<ClassStudentRow[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [kw, setKw] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { start(async () => setList(await listAssignableStudents(classId))); }, []);
  const shown = list.filter((s) => s.name.includes(kw.trim()));
  const apply = () => start(async () => {
    if (sel.size === 0) { await metaAlert("먼저 학생을 선택해주세요. "); return; }
    const r = await addStudentsToClass(classId, [...sel]);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장 완료");
    onDone();
  });
  return (
    <>
      <div className="modal fade modal-inner-scroll max-450 show" id="modalAddStudentInGroup" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">학생 추가</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body">
            <div className="search-input mb-16">
              <input type="search" placeholder="검색어 입력" value={kw} onChange={(e) => setKw(e.target.value)} />
              <button type="button">검색</button>
            </div>
            <table className="table table-default-list">
              <thead><tr>
                <th><div className="form-check d-flex gap-1">
                  <input type="checkbox" className="form-check-input" id="chkAllAddStd"
                    checked={shown.length > 0 && shown.every((s) => sel.has(s.id))}
                    onChange={(e) => setSel(e.target.checked ? new Set(shown.map((s) => s.id)) : new Set())} />
                  <label htmlFor="chkAllAddStd" className="form-check-label">학생 명</label></div></th>
                <th>단계</th><th>학년</th><th>학적상태</th>
              </tr></thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id}>
                    <td><div className="form-check d-flex gap-1">
                      <input type="checkbox" className="form-check-input" id={`addstd_${s.id}`} checked={sel.has(s.id)}
                        onChange={() => setSel((c) => { const n = new Set(c); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })} />
                      <label htmlFor={`addstd_${s.id}`} className="form-check-label">{s.name}</label></div></td>
                    <td>{stepNm(s.grade)}</td><td>{gradeNo(s.grade)}</td><td>{STATE_NM[s.state] ?? s.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

/** 원본 replacestudentsiframe.cshtml(반 이동 레이어팝업) 대체 */
function MoveStudentModal({ fromId, ids, classes, onClose, onDone, pending, start }: {
  fromId: string; ids: string[]; classes: ClassRow[]; onClose: () => void; onDone: () => void;
  pending: boolean; start: (fn: () => Promise<void>) => void;
}) {
  const [to, setTo] = useState("");
  const apply = () => start(async () => {
    const r = await moveStudentsToClass(fromId, to, ids);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장 완료");
    onDone();
  });
  return (
    <>
      <div className="modal fade modal-inner-scroll max-360 show" id="modalMoveStudent" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">반 이동</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body pt-8 pb-28">
            <ul className="list-setting">
              <li><span className="title">이동할 반</span>
                <div className="select__small">
                  <select value={to} onChange={(e) => setTo(e.target.value)}>
                    <option value="">선택하세요</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </li>
            </ul>
            <ul className="explain-list bw6 mt-16"><li>선택한 {ids.length}명이 현재 반에서 빠지고 위 반으로 이동합니다.</li></ul>
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
