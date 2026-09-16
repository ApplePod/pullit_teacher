"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { OriginalModal, BTN_CANCEL, BTN_APPLY, BTN_RED_MD } from "@/components/portal/OriginalModal";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { GRADE_LABEL } from "@/lib/mgmt-consts";
import { loadIB, studentBooks, allBooks, setStudentBooks, removeStudentBooks, type IBStudent, type IBBook, type IBClass } from "./ibActions";

// 원본 필터 코드 ↔ 우리 학년 코드
const GRADES: [string, string, string][] = [
  ["GRE1", "초1", "e1"], ["GRE2", "초2", "e2"], ["GRE3", "초3", "e3"], ["GRE4", "초4", "e4"], ["GRE5", "초5", "e5"], ["GRE6", "초6", "e6"],
  ["GRM1", "중1", "m1"], ["GRM2", "중2", "m2"], ["GRM3", "중3", "m3"],
  ["GRH1", "고1", "h1"], ["GRH2", "고2", "h2"], ["GRH3", "고3", "h3"],
];
const STATE_LABEL: Record<string, string> = { active: "정규학생", paused: "예비학생", left: "휴회학생" };
const SEMESTERS: [string, string, string][] = [["MS01", "예비", "paused"], ["MS10", "정규", "active"], ["MS99", "휴회", "left"]];
const cellRow = { display: "table", width: "100%", tableLayout: "fixed" } as const;

/** 원본 개별 학생 사용 교재 관리(individualStdBooks.cshtml) 마크업 그대로 + 우리 데이터 */
export function IBClient() {
  const router = useRouter();
  const layer = useLayerPopup();
  const [students, setStudents] = useState<IBStudent[]>([]);
  const [classes, setClasses] = useState<IBClass[]>([]);
  const [books, setBooks] = useState<IBBook[]>([]);
  const [sel, setSel] = useState<IBStudent | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [searchField, setSearchField] = useState("f_user_nm");
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [grades, setGrades] = useState<Set<string>>(new Set());
  const [semester, setSemester] = useState("");
  const [modal, setModal] = useState<IBBook[] | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => { start(async () => { const d = await loadIB(); setStudents(d.students); setClasses(d.classes); }); }, []);

  const reloadBooks = (studentId: string) => start(async () => { setBooks(await studentBooks(studentId)); setChecked(new Set()); });
  const pick = (s: IBStudent) => { setSel(s); reloadBooks(s.id); };

  const rows = students.filter((s) => {
    if (query) {
      const v = searchField === "f_user_nm" ? s.name : s.className;
      if (!v.includes(query)) return false;
    }
    if (classFilter === "-1" ? s.classId != null : classFilter && s.classId !== classFilter) return false;
    if (grades.size && !grades.has(s.grade)) return false;
    if (semester && s.state !== semester) return false;
    return true;
  });

  const needStudent = async (msg: string) => { if (!sel) { await metaAlert(msg); return false; } return true; };

  const cancelBooks = async () => {
    if (!(await needStudent("학생을 선택해주세요."))) return;
    if (!checked.size) { await metaAlert("선택된 교재가 없습니다."); return; }
    if (!(await metaConfirm("선택한 교재를 사용 교재에서 제외할까요?"))) return;
    start(async () => { await removeStudentBooks(sel!.id, [...checked]); setBooks(await studentBooks(sel!.id)); setChecked(new Set()); refreshCounts(); });
  };
  const refreshCounts = () => start(async () => { const d = await loadIB(); setStudents(d.students); setSel((p) => (p ? d.students.find((x) => x.id === p.id) ?? p : p)); });

  const openPicker = async () => {
    if (!(await needStudent("목록에서 학생을 선택해 주세요."))) return;
    start(async () => setModal(await allBooks()));
  };

  const toggleGrade = (code: string) => setGrades((g) => { const n = new Set(g); if (n.has(code)) n.delete(code); else n.add(code); return n; });

  return (
    <>
      {layer.popup}
      <div className="contents-header contents-header__detail">
        <div className="contents-header__wrap">
          <div className="left-area">
            <div className="bread-crumbs"><span>관리</span><span>사용교재</span></div>
            <a href="/management/book" className="back-btn" onClick={(e) => { e.preventDefault(); router.push("/management/book"); }}>
              <img src="/assets/center/images/common/back_header_icon.svg" alt="" />
            </a>
            <h2>개별 학생 사용 교재 관리</h2>
          </div>
          <div className="right-area"></div>
        </div>
      </div>
      <div className="contens-body">
        <div className="listFilter-wrap">
          <div className="d-flex">
            <li className="fold col d-flex">
              <label className="listFilter-title">검색어</label>
              <div className="listFilter-items">
                <div className="search-select">
                  <div className="select__small">
                    <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                      <option value="f_user_nm">학생명</option>
                      <option value="f_group_nm">소속반명</option>
                    </select>
                  </div>
                  <div className="search-input">
                    <input type="search" placeholder="검색어 입력" value={keyword}
                      onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setQuery(keyword); }} />
                    <button type="button" onClick={() => setQuery(keyword)}>검색</button>
                  </div>
                </div>
              </div>
            </li>
            <li className="fold col d-flex">
              <label className="listFilter-title">소속반</label>
              <div className="listFilter-items">
                <div className="search-select">
                  <div className="select__small">
                    <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                      <option value="">전체</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      <option value="-1">임시 미지정반</option>
                    </select>
                  </div>
                </div>
              </div>
            </li>
          </div>
          <ul><li>
            <label className="listFilter-title"><span className="fw-600">학년/학적</span></label>
            <div className="listFilter-items">
              <div className="filter-check">
                <input type="checkbox" name="filtergradeAll" id="fGradeAll" value=""
                  checked={grades.size === GRADES.length} onChange={(e) => setGrades(e.target.checked ? new Set(GRADES.map(([, , g]) => g)) : new Set())} />
                <label htmlFor="fGradeAll">전체</label>
              </div>
              {[GRADES.slice(0, 6), GRADES.slice(6, 9), GRADES.slice(9)].map((chunk, i) => (
                <div className="filter-check" key={i}>
                  {chunk.map(([code, label, ours]) => (
                    <Fragment key={code}>
                      <input type="checkbox" name="filtergrade" id={`fGrade_${code}`} value={code} checked={grades.has(ours)} onChange={() => toggleGrade(ours)} />
                      <label htmlFor={`fGrade_${code}`}>{label}</label>
                    </Fragment>
                  ))}
                </div>
              ))}
              <div className="filter-radio">
                {SEMESTERS.map(([code, label, ours], i) => (
                  <Fragment key={code}>
                    <input type="radio" name="filterSemesterA" id={`filterSemester_${i}`} value={code}
                      checked={semester === ours} onChange={() => setSemester(semester === ours ? "" : ours)} onClick={() => { if (semester === ours) setSemester(""); }} />
                    <label htmlFor={`filterSemester_${i}`}>{label}</label>
                  </Fragment>
                ))}
              </div>
            </div>
          </li></ul>
        </div>

        <table className="table table-default-list">
          <thead style={cellRow}>
            <tr><th className="text-left">학생 명</th><th>학적상태</th><th>단계</th><th>학년</th><th>소속반</th><th>사용 교재 수</th></tr>
          </thead>
          <tbody style={{ display: "block", overflowY: "auto", maxHeight: 266 }}>
            {rows.map((s) => (
              <tr key={s.id} style={cellRow}>
                <td>
                  <label className="radio-select__item bw10 f-14 title-line">
                    <input type="radio" name="radio-select01" className="form-radio" value={s.id} checked={sel?.id === s.id} onChange={() => pick(s)} /> {s.name}
                  </label>
                </td>
                <td>{STATE_LABEL[s.state] ?? s.state}</td>
                <td>{s.level ?? "-"}</td>
                <td>{GRADE_LABEL[s.grade] ?? s.grade}</td>
                <td>{s.className}</td>
                <td>{s.bookCount}권</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr style={cellRow}><td colSpan={6} style={{ textAlign: "center", padding: 20, height: 50, lineHeight: "50px" }}>{pending ? "불러오는 중…" : "학생이 없습니다."}</td></tr>
            )}
          </tbody>
        </table>

        <h4 className="d-flex justify-content-between fw-700 f-16 mt-24 mb-16">사용교재</h4>
        <div className="category-btns mb-8">
          <div className="left-area">
            <button type="button" className="category-btns-item" onClick={cancelBooks}>교재 선택 취소</button>
          </div>
          <div className="right-area">
            <button type="button" className={BTN_RED_MD} onClick={openPicker}>개별 교재 선택</button>
            <button type="button" className={BTN_RED_MD} onClick={async () => { if (await needStudent("목록에서 학생을 선택해 주세요.")) router.push("/clinic/autobook"); }}>교재매칭 채점</button>
            <button type="button" className={BTN_RED_MD} onClick={async () => { if (await needStudent("목록에서 학생을 선택해 주세요.")) layer.open("/popup/paper/make"); }}>교재매칭 문제지만들기</button>
          </div>
        </div>
        <table className="table table-bordered table-default-list">
          <thead style={cellRow}>
            <tr>
              <th>
                <div className="form-check d-flex gap-1">
                  <input type="checkbox" name="user" className="form-check-input" id="checkAll"
                    checked={books.length > 0 && checked.size === books.length}
                    onChange={(e) => setChecked(e.target.checked ? new Set(books.map((b) => b.id)) : new Set())} />
                  <label htmlFor="checkAll" className="form-check-label d-flex flex-column">교재명</label>
                </div>
              </th>
              <th>구분</th><th>사용학생</th>
            </tr>
          </thead>
          <tbody style={{ display: "block", overflowY: "auto", maxHeight: 285 }}>
            {!sel && (
              <tr><td colSpan={3} style={{ ...cellRow, textAlign: "center", padding: 20, height: 50, lineHeight: "50px" }}>학생을 선택해 주세요.</td></tr>
            )}
            {sel && books.length === 0 && (
              <tr><td colSpan={3} style={{ ...cellRow, textAlign: "center", padding: 20, height: 50, lineHeight: "50px" }}>사용 중인 교재가 없습니다.</td></tr>
            )}
            {sel && books.map((b) => (
              <tr key={b.id} style={cellRow}>
                <td>
                  <div className="form-check d-flex gap-1">
                    <input type="checkbox" className="form-check-input" id={`book_${b.id}`} checked={checked.has(b.id)}
                      onChange={() => setChecked((c) => { const n = new Set(c); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; })} />
                    <label htmlFor={`book_${b.id}`} className="form-check-label d-flex flex-column">{b.name}{b.publisher ? <span className="f-12 bw6">{b.publisher}</span> : null}</label>
                  </div>
                </td>
                <td>{b.kind}</td>
                <td>{b.userCount}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && sel && (
        <BookPicker books={modal} owned={new Set(books.map((b) => b.id))} studentName={sel.name}
          onClose={() => setModal(null)}
          onApply={(ids) => {
            const own = new Set(books.map((b) => b.id));
            const add = ids.filter((i) => !own.has(i));
            const del = [...own].filter((i) => !ids.includes(i));
            start(async () => {
              if (add.length) await setStudentBooks(sel.id, add);
              if (del.length) await removeStudentBooks(sel.id, del);
              setBooks(await studentBooks(sel.id)); setChecked(new Set()); setModal(null); refreshCounts();
            });
          }} />
      )}
    </>
  );
}

function BookPicker({ books, owned, studentName, onClose, onApply }: {
  books: IBBook[]; owned: Set<string>; studentName: string; onClose: () => void; onApply: (ids: string[]) => void;
}) {
  const [sel, setSel] = useState<Set<string>>(new Set(owned));
  return (
    <OriginalModal id="ib-book-modal" title={<>{studentName} 학생 개별 교재 선택</>} onClose={onClose}
      footer={<><button type="button" className={BTN_CANCEL} onClick={onClose}>취소</button>
        <button type="button" className={BTN_APPLY} onClick={() => onApply([...sel])}>적용</button></>}>
      <table className="table table-bordered table-default-list">
        <thead><tr><th className="text-left">교재명</th><th>출판사</th><th>선택</th></tr></thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td className="text-left">{b.name}</td>
              <td>{b.publisher ?? "-"}</td>
              <td>
                <input type="checkbox" className="form-check-input" checked={sel.has(b.id)}
                  onChange={() => setSel((s) => { const n = new Set(s); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; })} />
              </td>
            </tr>
          ))}
          {books.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 20 }}>등록된 교재가 없습니다. [교재등록]에서 먼저 추가해 주세요.</td></tr>}
        </tbody>
      </table>
    </OriginalModal>
  );
}
