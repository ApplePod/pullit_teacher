"use client";

import { Fragment, useCallback, useEffect, useState, useTransition } from "react";
import { SelectAllCheckbox } from "@/components/portal/SelectAllCheckbox";
import { useRouter, useSearchParams } from "next/navigation";
import { metaAlert } from "@/components/portal/MetaModal";
import {
  getClassName, listClassStudentsSimple, listClassTextbooks, listStudentTextbooks, listAllTextbooks,
  setClassTextbooks, removeClassTextbooks, setStudentTextbooks, removeStudentTextbooks, createBook,
  type MappingBook, type SimpleStudent,
} from "../bookActions";

/** 원본 MappingTextBooks.cshtml (반별/학생별 교재 관리) */
export function MappingClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const groupId = sp.get("gid") ?? "";
  const [schType, setSchType] = useState<"group" | "student">(sp.get("reqKind") === "student" ? "student" : "group");
  const [hGroupName, setHGroupName] = useState(decodeURIComponent(sp.get("gNm") ?? ""));
  const [stdList, setStdList] = useState<SimpleStudent[]>([]);
  const [sltStdId, setSltStdId] = useState("");
  const [list, setList] = useState<MappingBook[]>([]);
  const [chk, setChk] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [picker, setPicker] = useState<null | "group" | "student">(null);
  const [pending, start] = useTransition();

  const reload = useCallback(() => start(async () => {
    setChk(new Set());
    if (schType === "group") setList(await listClassTextbooks(groupId, keyword));
    else if (sltStdId) setList(await listStudentTextbooks(groupId, sltStdId));
    else setList([]);
  }), [schType, groupId, keyword, sltStdId]);

  useEffect(() => {
    start(async () => {
      const nm = await getClassName(groupId);
      setHGroupName((prev) => prev || nm);
      setStdList(await listClassStudentsSimple(groupId));
    });
  }, [groupId]);
  useEffect(() => { reload(); }, [reload]);

  const sltStdNm = stdList.find((s) => s.id === sltStdId)?.name ?? "";
  const toggle = (id: string) => setChk((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  /** 원본 doGroupBookDel */
  const doGroupBookDel = () => start(async () => {
    if (chk.size === 0) { await metaAlert("교재를 선택하세요."); return; }
    const r = await removeClassTextbooks(groupId, [...chk]);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("삭제 되었습니다.");
    reload();
  });
  /** 원본 doBooksDel — 선택 학생의 '반개별' 교재만 삭제 가능 */
  const doBooksDel = () => start(async () => {
    const targets = list.filter((b) => chk.has(b.id) && b.student_id !== "").map((b) => b.id);
    if (targets.length === 0) { await metaAlert("교재를 선택하세요."); return; }
    const r = await removeStudentTextbooks(sltStdId, targets);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("삭제 되었습니다.");
    reload();
  });
  /** 원본 doSetTextbooks — 교재 선택 팝업(MngTextbook.cshtml) 대체 */
  const doSetTextbooks = async (type: "group" | "student") => {
    if (type === "student" && sltStdId === "") { await metaAlert("학생을 선택하세요."); return; }
    setPicker(type);
  };
  /** 원본 doSetBookMarking / doSetBookMarking4std — 교재매칭 채점 */
  const doSetBookMarking = async () => {
    if (schType === "group" ? stdList.length === 0 : sltStdId === "") { await metaAlert("학생 또는 교재 여부를 확인해주세요."); return; }
    router.push("/clinic/autobook");
  };
  /** 원본 doMakeMarkingPaper / doMakeMarkingPaper4std — 교재매칭 문제지만들기 */
  const doMakeMarkingPaper = async () => {
    if (schType === "group" ? stdList.length === 0 : sltStdId === "") { await metaAlert("학생 또는 교재 여부를 확인해주세요."); return; }
    if (chk.size !== 1) { await metaAlert("교재를 1권 선택해주세요."); return; }
    router.push("/paper/make");
  };

  return (
    <div className="contens-body">
      <h4 className="d-flex justify-content-between fw-700 f-16 mb-16">{hGroupName}</h4>
      <ul className="list-tab--3 mt-16 mb-24" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link${schType === "group" ? " active" : ""}`} id="navGroup" type="button" role="tab"
            onClick={() => setSchType("group")}>반 별 교재 관리</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link${schType === "student" ? " active" : ""}`} id="navGroupStd" type="button" role="tab"
            onClick={() => setSchType("student")}>학생별 교재 관리</button>
        </li>
      </ul>

      <div className="tab-content">
        {schType === "group" && (
          <div className="tab-pane fade active show" role="tabpanel">
            <div className="listFilter-wrap">
              <ul>
                <li>
                  <label className="listFilter-title">교재명</label>
                  <div className="listFilter-items">
                    <div className="search-select"><div className="search-input">
                      <input type="search" placeholder="검색어 입력" value={keyword}
                        onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && reload()} />
                      <button onClick={reload}>검색</button>
                    </div></div>
                  </div>
                </li>
                <li>
                  <label className="listFilter-title"><span className="fw-600">학생</span></label>
                  <div className="slide-group"><ul className="slide-box"><li className="slide-box__item">
                    <div className="filter-check" style={{ top: 0 }}>
                      {stdList.map((s) => <label key={s.id} className="border-none" style={{ cursor: "default" }}>{s.name}</label>)}
                      {stdList.length === 0 && <label className="border-none" style={{ cursor: "default" }}>등록된 학생이 없습니다.</label>}
                    </div>
                  </li></ul></div>
                </li>
              </ul>
            </div>

            <h4 className="d-flex justify-content-between fw-700 f-16 mt-24 mb-16">사용교재</h4>
            <div className="category-btns mb-8">
              <div className="left-area">
                <button type="button" className="category-btns-item" onClick={doGroupBookDel}>교재 선택 취소</button>
              </div>
              <div className="right-area">
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => doSetTextbooks("group")}>공통 교재 선택</button>
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doSetBookMarking}>교재매칭 채점</button>
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doMakeMarkingPaper}>교재매칭 문제지만들기</button>
              </div>
            </div>
            <table className="table table-bordered table-default-list">
              <thead><tr>
                <th><div className="form-check d-flex gap-1">
                  <SelectAllCheckbox  name="user" className="form-check-input" id="checkGroupAll"
                    
                     total={list.length} allSelected={chk.size === list.length} onToggle={(v) => setChk(v ? new Set(list.map((b) => b.id)) : new Set())} />
                  <label htmlFor="checkGroupAll" className="form-check-label d-flex flex-column">교재명</label>
                </div></th>
                <th>구분</th><th>반명</th>
              </tr></thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="name"><div className="form-check d-flex gap-1">
                      <input type="checkbox" name="chkBookId" className="form-check-input" id={`chkBooks_${item.id}`}
                        value={item.id} checked={chk.has(item.id)} onChange={() => toggle(item.id)} />
                      <label htmlFor={`chkBooks_${item.id}`} className="form-check-label">{item.name}</label>
                    </div></td>
                    <td>반공통</td>
                    <td>{item.group_names}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {schType === "student" && (
          <div className="tab-pane fade active show" role="tabpanel">
            <div className="listFilter-wrap">
              <ul>
                <li>
                  <label className="listFilter-title"><span className="fw-600">학생</span></label>
                  <div className="slide-group"><ul className="slide-box"><li className="slide-box__item">
                    <div className="filter-check" style={{ top: 0 }}>
                      {stdList.map((s, index) => (
                        <Fragment key={s.id}>
                          <input type="radio" name="filterGrade" id={`chkStdName_${index}`} value={s.id}
                            checked={sltStdId === s.id} onChange={() => setSltStdId(s.id)} />
                          <label htmlFor={`chkStdName_${index}`}>{s.name}</label>
                        </Fragment>
                      ))}
                      {stdList.length === 0 && <label className="border-none" style={{ cursor: "default" }}>등록된 학생이 없습니다.</label>}
                    </div>
                  </li></ul></div>
                </li>
              </ul>
            </div>
            <h4 className="d-flex justify-content-between fw-700 f-16 mt-24 mb-16">사용교재</h4>
            <div className="category-btns mb-8">
              <div className="left-area">
                <button type="button" className="category-btns-item" onClick={doBooksDel}>교재 선택 취소</button>
              </div>
              <div className="right-area">
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => doSetTextbooks("student")}>개별 교재 선택</button>
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doSetBookMarking}>교재매칭 채점</button>
                <button type="button" className="button__line button__fill--medium button__fill--red" onClick={doMakeMarkingPaper}>교재매칭 문제지만들기</button>
              </div>
            </div>
            <table className="table table-bordered table-default-list">
              <thead><tr>
                <th><div className="form-check d-flex gap-1">
                  <SelectAllCheckbox  name="user" className="form-check-input" id="checkAll"
                    
                     total={list.length} allSelected={chk.size === list.length} onToggle={(v) => setChk(v ? new Set(list.map((b) => b.id)) : new Set())} />
                  <label htmlFor="checkAll" className="form-check-label d-flex flex-column">교재명</label>
                </div></th>
                <th>구분</th><th>사용학생</th>
              </tr></thead>
              <tbody>
                {list.map((item, index) => (
                  <tr key={item.id}>
                    <td className="name"><div className="form-check d-flex gap-1">
                      <input type="checkbox" name="chkStdBookId" className="form-check-input" disabled={item.student_id === ""}
                        id={`chkStdBookId_${index}`} value={item.id} checked={chk.has(item.id)} onChange={() => toggle(item.id)} />
                      <label htmlFor={`chkStdBookId_${index}`} className="form-check-label d-flex flex-column">{item.name}</label>
                    </div></td>
                    <td>{item.student_id !== "" ? "반개별" : "반공통"}</td>
                    <td>{sltStdNm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {picker && (
        <BookPickerModal kind={picker} onClose={() => setPicker(null)} pending={pending} start={start}
          onApply={(ids) => start(async () => {
            const r = picker === "group" ? await setClassTextbooks(groupId, ids) : await setStudentTextbooks(sltStdId, ids);
            if (r.error) { await metaAlert(r.error); return; }
            setPicker(null); reload();
          })} />
      )}
    </div>
  );
}

/** 원본 교재 선택 팝업(MngTextbook.cshtml) 대체 — 우리 교재 목록에서 선택 + 신규 등록 */
function BookPickerModal({ kind, onClose, onApply, pending, start }: {
  kind: "group" | "student"; onClose: () => void; onApply: (ids: string[]) => void;
  pending: boolean; start: (fn: () => Promise<void>) => void;
}) {
  const [books, setBooks] = useState<{ id: string; name: string; publisher: string | null }[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [nf, setNf] = useState({ name: "", publisher: "", subject: "" });
  const reload = () => start(async () => setBooks(await listAllTextbooks()));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, []);
  const add = () => start(async () => {
    const r = await createBook(nf);
    if (r.error) { await metaAlert(r.error); return; }
    setNf({ name: "", publisher: "", subject: "" });
    setBooks(await listAllTextbooks());
  });
  const apply = async () => {
    if (sel.size === 0) { await metaAlert("교재를 선택하세요."); return; }
    onApply([...sel]);
  };
  return (
    <>
      <div className="modal fade modal-inner-scroll max-450 show" id="modalMngTextbook" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">{kind === "group" ? "공통 교재 선택" : "개별 교재 선택"}</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body">
            <div className="d-flex gap-1 mb-16">
              <input type="text" className="form-control" placeholder="교재명" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} />
              <input type="text" className="form-control" placeholder="출판사" value={nf.publisher} onChange={(e) => setNf({ ...nf, publisher: e.target.value })} />
              <div className="select__small">
                <select value={nf.subject} onChange={(e) => setNf({ ...nf, subject: e.target.value })}>
                  <option value="">공통</option><option value="math">수학</option><option value="english">영어</option>
                </select>
              </div>
              <button type="button" className="btn btn-default" onClick={add} disabled={pending}>교재 등록</button>
            </div>
            <table className="table table-bordered table-default-list">
              <thead><tr><th>교재명</th><th>출판사</th></tr></thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <td className="name"><div className="form-check d-flex gap-1">
                      <input type="checkbox" className="form-check-input" id={`pick_${b.id}`} checked={sel.has(b.id)}
                        onChange={() => setSel((c) => { const n = new Set(c); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; })} />
                      <label htmlFor={`pick_${b.id}`} className="form-check-label">{b.name}</label>
                    </div></td>
                    <td>{b.publisher ?? ""}</td>
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
