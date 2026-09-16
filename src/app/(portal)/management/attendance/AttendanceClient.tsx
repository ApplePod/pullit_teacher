"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { fmtMonth } from "@/lib/date";
import { metaAlert } from "@/components/portal/MetaModal";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { loadMonth, saveMonth, listClassOptions, type AttStudent, type AttRecord } from "./attendanceActions";

/** 원본 _CODE4CD('GR') */
const GR: [string, string, string][] = [
  ["GRE0", "예비초", "e0"], ["GRE1", "초1", "e1"], ["GRE2", "초2", "e2"], ["GRE3", "초3", "e3"],
  ["GRE4", "초4", "e4"], ["GRE5", "초5", "e5"], ["GRE6", "초6", "e6"],
  ["GRM1", "중1", "m1"], ["GRM2", "중2", "m2"], ["GRM3", "중3", "m3"],
  ["GRH1", "고1", "h1"], ["GRH2", "고2", "h2"], ["GRH3", "고3", "h3"], ["GR99", "기타", "etc"],
];
/** 원본 A:출석 L:지각 E:조퇴 X:결석 -:미처리 */
const CSS: Record<string, string> = { A: "present", L: "late", E: "early", X: "absent", "-": "none" };
const TXT: Record<string, string> = { A: "출석", L: "지각", E: "조퇴", X: "결석", "-": "-" };
const NEXT: Record<string, string> = { A: "L", L: "E", E: "X", X: "-", "-": "A" };
const stepNm = (g: string) => (g.startsWith("e") ? "초등" : g.startsWith("m") ? "중등" : g.startsWith("h") ? "고등" : g === "n" ? "N수" : "기타");
const gradeLv = (g: string) => (/^[emh]\d$/.test(g) ? `${g[1]}학년` : "");

function ymList() {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  for (let i = 0; i < 36; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}
function thisMonth() { return fmtMonth(); }

function buildGrid(ym: string, students: AttStudent[], records: AttRecord[]) {
  const [y, m] = ym.split("-").map(Number);
  const len = new Date(y, m, 0).getDate();
  const g: Record<string, string[]> = {};
  students.forEach((s) => { g[s.id] = Array.from({ length: len }, () => "-"); });
  records.forEach((r) => {
    const d = Number(r.attended_on.slice(8, 10));
    if (g[r.student_id] && d >= 1 && d <= len) g[r.student_id][d - 1] = r.status;
  });
  return g;
}

export function AttendanceClient({ initialMonth, initialData, initialClasses = [] }: {
  initialMonth?: string; initialData?: { students: AttStudent[]; records: AttRecord[] }; initialClasses?: { id: string; name: string }[];
}) {
  const yyyyMMList = useMemo(() => ymList(), []);
  const [setDate, setSetDate] = useState(initialMonth ?? thisMonth());
  const first = useRef(!!initialData);
  const [students, setStudents] = useState<AttStudent[]>(initialData?.students ?? []);
  const [grid, setGrid] = useState<Record<string, string[]>>(
    initialData && initialMonth ? buildGrid(initialMonth, initialData.students, initialData.records) : {});
  const [chklist, setChklist] = useState<Set<string>>(new Set());
  const [key, setKey] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("");
  const [classId, setClassId] = useState("");
  const [classList, setClassList] = useState<{ id: string; name: string }[]>(initialClasses);
  const [smsYn, setSmsYn] = useState("");
  const [foldOpen, setFoldOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageView, setPageView] = useState(10);
  const [smsSettings, setSmsSettings] = useState(false);
  const [sendText, setSendText] = useState(false);
  const [pending, start] = useTransition();

  const days = useMemo(() => {
    const [y, m] = setDate.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    return Array.from({ length: last }, (_, i) => {
      const d = new Date(y, m - 1, i + 1);
      return { day: i + 1, shotMD: `${m}.${i + 1}`, week: d.getDay() === 0 || d.getDay() === 6 };
    });
  }, [setDate]);

  const load = useCallback((ym: string, o?: { key?: string; keyword?: string; grade?: string; classId?: string }) => {
    start(async () => {
      const { students, records } = await loadMonth(ym, { key, keyword, grade, classId, ...o });
      setStudents(students); setGrid(buildGrid(ym, students, records));
    });
  }, [key, keyword, grade, classId]);

  // 첫 렌더는 서버가 내려준 이번 달 데이터를 사용
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (first.current) { first.current = false; return; } load(setDate); }, [setDate]);

  const firstClasses = useRef(initialClasses.length > 0);
  useEffect(() => {
    if (firstClasses.current && !grade) { firstClasses.current = false; return; }
    start(async () => setClassList(await listClassOptions(grade || undefined)));
  }, [grade]);

  let shown = students;
  if (smsYn) shown = shown.filter((s) => s.in_sms_send_yn === smsYn);
  const cnt = shown.length;
  const totalPage = Math.max(1, Math.ceil(cnt / pageView));
  const pageRows = shown.slice((page - 1) * pageView, page * pageView);

  const setCell = (sid: string, day: number, v: string) =>
    setGrid((g) => { const row = [...(g[sid] ?? [])]; row[day - 1] = v; return { ...g, [sid]: row }; });

  /** 원본 doCellClick */
  const doCellClick = (sid: string, day: number) => setCell(sid, day, NEXT[grid[sid]?.[day - 1] ?? "-"]);
  /** 원본 doRowUser — 학생명 클릭 시 한 행 전체 순환 */
  const doRowUser = (sid: string) => {
    const cur = grid[sid]?.find((v) => v !== "-") ?? "-";
    const nv = NEXT[cur];
    setGrid((g) => ({ ...g, [sid]: (g[sid] ?? []).map((_, i) => (days[i]?.week ? g[sid][i] : nv)) }));
  };
  /** 원본 doCheckDay — 날짜 헤더 클릭 시 한 열 전체 순환 */
  const doCheckDay = (day: number) => {
    const cur = pageRows[0] ? grid[pageRows[0].id]?.[day - 1] ?? "-" : "-";
    const nv = NEXT[cur];
    setGrid((g) => {
      const n = { ...g };
      pageRows.forEach((s) => { const row = [...(n[s.id] ?? [])]; row[day - 1] = nv; n[s.id] = row; });
      return n;
    });
  };
  /** 원본 doAllAtdStateChange — 주말 제외 전체 일괄 변경 */
  const doAllAtdStateChange = (v: string) => setGrid((g) => {
    const n = { ...g };
    pageRows.forEach((s) => { n[s.id] = (n[s.id] ?? []).map((cur, i) => (days[i]?.week ? cur : v)); });
    return n;
  });

  /** 원본 doSubmit */
  const doSubmit = () => start(async () => {
    const rows = students.map((s) => ({ student_id: s.id, data: (grid[s.id] ?? []).join("#") }));
    const r = await saveMonth(setDate, rows);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("저장 완료");
    load(setDate);
  });

  const doModalSetSMS = async () => {
    if (chklist.size === 0) { await metaAlert("대상을 선택해주세요."); return; }
    setSmsSettings(true);
  };
  const doModalSendSMS = async () => {
    if (chklist.size === 0) { await metaAlert("대상을 선택해주세요."); return; }
    setSendText(true);
  };
  /** 원본 doModalPrint → AttendancePrint.cshtml 팝업 (미이관) — 브라우저 인쇄로 대체 */
  const doModalPrint = () => window.print();

  return (
    <>
      {/* 원본 #contents 안의 구버전 헤더(스타일시트에서 display:none) — DOM 구조 그대로 유지 */}
      <div className="contents-header">
        <div className="contents-header__wrap">
          <div className="left-area">
            <span className="material-symbols-sharp">manage_accounts</span>
            <h2>관리</h2>
          </div>
          <div className="right-area">
            <button type="button" className="button__line button__fill--medium button__fill--red">
              <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i>문제지 만들기</button>
          </div>
        </div>
      </div>
      <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="listFilter-wrap">
        <ul>
          <li>
            <label className="listFilter-title">검색 기간</label>
            <div className="listFilter-items">
              <div className="select__small">
                <select value={setDate} onChange={(e) => { setSetDate(e.target.value); setPage(1); }}>
                  {yyyyMMList.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </li>
          <li>
            <label className="listFilter-title">검색어</label>
            <div className="listFilter-items">
              <div className="search-select">
                <div className="select__small">
                  <select value={key} onChange={(e) => setKey(e.target.value)}>
                    <option value="all">전체</option>
                    <option value="user_nm">학생명</option>
                    <option value="group_nm">소속반명</option>
                  </select>
                </div>
                <div className="search-input">
                  <input type="search" placeholder="검색어 입력" value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(setDate); } }} />
                  <button onClick={() => { setPage(1); load(setDate); }}>검색</button>
                </div>
              </div>
            </div>
          </li>
          <li className={`fold-top${foldOpen ? " active" : ""}`}>
            <label className="listFilter-title" onClick={() => setFoldOpen(!foldOpen)}>
              <span className="fw-600">필터</span>
              <span className="material-symbols-sharp f-18">{foldOpen ? "remove" : "add"}</span>
            </label>
            <div className="listFilter-items">
              <div className="filter-check element-highschool-not">
                <input type="radio" id="filterGrade_00" name="filterGrade" value="" checked={grade === ""}
                  onChange={() => { setGrade(""); setClassId(""); setPage(1); load(setDate, { grade: "", classId: "" }); }} />
                <label htmlFor="filterGrade_00">전체</label>
                {GR.map(([code, nm, db]) => (
                  <Fragment key={code}>
                    <input type="radio" id={`filterGrade_${code}`} name="filterGrade" value={code} checked={grade === db}
                      onChange={() => { setGrade(db); setClassId(""); setPage(1); load(setDate, { grade: db, classId: "" }); }} />
                    <label htmlFor={`filterGrade_${code}`}>{nm}</label>
                  </Fragment>
                ))}
              </div>
            </div>
          </li>
          <div className="d-flex">
            <li className={`fold col${foldOpen ? " active" : ""}`}>
              <label className="listFilter-title">반</label>
              <div className="listFilter-items">
                <div className="select__small">
                  <select value={classId} onChange={(e) => { setClassId(e.target.value); setPage(1); load(setDate, { classId: e.target.value }); }}>
                    <option value="">선택하세요</option>
                    {classList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </li>
            <li className={`fold col${foldOpen ? " active" : ""}`}>
              <label className="listFilter-title">입실상태</label>
              <div className="listFilter-items">
                <div className="filter-check">
                  <input type="checkbox" name="filterSMSSendYn" id="filterSMSSendYnAll" value="" checked={smsYn === ""} onChange={() => { setSmsYn(""); setPage(1); }} />
                  <label htmlFor="filterSMSSendYnAll">전체</label>
                  <input type="checkbox" name="filterSMSSendYn" id="filterSMSSendY" value="Y" checked={smsYn === "Y"} onChange={() => { setSmsYn("Y"); setPage(1); }} />
                  <label htmlFor="filterSMSSendY">보냄</label>
                  <input type="checkbox" name="filterSMSSendYn" id="filterSMSSendN" value="N" checked={smsYn === "N"} onChange={() => { setSmsYn("N"); setPage(1); }} />
                  <label htmlFor="filterSMSSendN">안보냄</label>
                </div>
              </div>
            </li>
          </div>
        </ul>
      </div>

      <div className="category-btns mt-24">
        <div className="left-area">
          <button type="button" className="category-btns-item" onClick={doModalSetSMS}>문자발송 설정</button>
          <button type="button" className="category-btns-item" onClick={doModalSendSMS}>출결문자 전송</button>
          <button type="button" className="category-btns-item" onClick={doModalPrint}>인쇄</button>
        </div>
        <div className="right-area">
          <button type="button" className="category-btns-item" onClick={doSubmit} disabled={pending}>저장</button>
        </div>
      </div>

      <div className="d-flex table-rollcall">
        <div className="col table-rollcall-head">
          <table className="table table-bordered mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>
                  <div className="form-check d-flex gap-1">
                    <input type="checkbox" name="userAll" className="form-check-input" id="checkStudentAll"
                      checked={pageRows.length > 0 && pageRows.every((s) => chklist.has(s.id))}
                      onChange={(e) => setChklist(e.target.checked ? new Set(pageRows.map((s) => s.id)) : new Set())} />
                    <label htmlFor="checkStudentAll" className="form-check-label d-flex flex-column" style={{ marginLeft: 25 }}>학생명</label>
                  </div>
                </th>
                <th style={{ minWidth: 64 }}>입실 발송</th>
                <th style={{ minWidth: 64 }}>퇴실 발송</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id}>
                  <td className="name">
                    <div className="form-check d-flex gap-1 title-line">
                      <input type="checkbox" name="chkUId" id={`chkUid_${s.id}`} value={s.id} className="form-check-input"
                        checked={chklist.has(s.id)}
                        onChange={() => setChklist((c) => { const n = new Set(c); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })} />
                      <span onClick={() => doRowUser(s.id)} className="form-check-label d-block line-clamp-1 text-start"
                        style={{ marginLeft: 25, maxWidth: 72, cursor: "pointer" }}>
                        {s.name}
                        <span className="info"><span>{stepNm(s.grade)}</span><span>{gradeLv(s.grade)}</span></span>
                      </span>
                    </div>
                  </td>
                  <td><button type="button" onClick={() => { setChklist(new Set([s.id])); setSmsSettings(true); }}>{s.in_sms_send_yn === "Y" ? "보냄" : "안보냄"}</button></td>
                  <td><button type="button" onClick={() => { setChklist(new Set([s.id])); setSmsSettings(true); }}>{s.ot_sms_send_yn === "Y" ? "보냄" : "안보냄"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-9">
          <div className="table-responsive">
            <table className="table table-bordered table-rollcall-data">
              <thead>
                <tr>
                  {days.map((d) => (
                    <th key={d.day} className="col" data-day="">
                      <label className="form-check-label d-flex flex-column" style={{ cursor: "pointer" }} onClick={() => doCheckDay(d.day)}>{d.shotMD}</label>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s) => (
                  <tr key={s.id}>
                    {days.map((d) => {
                      const v = grid[s.id]?.[d.day - 1] ?? "-";
                      return (
                        <td key={d.day} className={d.week ? "weekend" : ""}>
                          <span onClick={() => doCellClick(s.id, d.day)} id={`spnCell_${s.id}_${d.day}`}
                            className={CSS[v]} data-atd={v} style={{ cursor: "pointer" }}>{TXT[v]}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="category-btns mt-24">
        <div className="left-area"></div>
        <div className="right-area">
          <button className="category-btns-item present" onClick={() => doAllAtdStateChange("A")}>출석</button>
          <button className="category-btns-item late" onClick={() => doAllAtdStateChange("L")}>지각</button>
          <button className="category-btns-item early" onClick={() => doAllAtdStateChange("E")}>조퇴</button>
          <button className="category-btns-item absent" onClick={() => doAllAtdStateChange("X")}>결석</button>
          <button className="category-btns-item none" onClick={() => doAllAtdStateChange("-")}>미처리</button>
        </div>
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
          <a href="javascript:void(0);" className={`prev${page <= 1 ? " disabled" : ""}`} onClick={() => page > 1 && setPage(page - 1)}><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
          {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
            <a key={n} href="javascript:void(0);" className={page === n ? "active" : ""} onClick={() => setPage(n)}>{n}</a>
          ))}
          <a href="javascript:void(0);" className={`${page >= totalPage ? "disabled " : ""}next`} onClick={() => page < totalPage && setPage(page + 1)}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
        </div></div>
      </div>

      {smsSettings && <SmsSettingsModal onClose={() => setSmsSettings(false)} />}
      {sendText && <SendTextModal count={chklist.size} onClose={() => setSendText(false)} />}
      </div>
    </>
  );
}

/** 원본 #modalSMSSettings 마크업 그대로 (문자 발송 설정) */
function SmsSettingsModal({ onClose }: { onClose: () => void }) {
  const ok = async () => { onClose(); await metaAlert("준비 중입니다."); };
  return (
    <>
      <div className="modal fade modal-inner-scroll max-360 show" id="modalSMSSettings" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h6 className="f-14">문자 발송 설정</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body pt-8 pb-28">
            <ul className="list-setting">
              <li><span className="title">입실문자</span>
                <div className="filter-radio justify-center">
                  <input type="radio" name="rdoSetCheckInSMSYN" value="Y" id="rdoSetCheckInSMS_Y" defaultChecked />
                  <label htmlFor="rdoSetCheckInSMS_Y">보냄</label>
                  <input type="radio" name="rdoSetCheckInSMSYN" value="N" id="rdoSetCheckInSMS_N" />
                  <label htmlFor="rdoSetCheckInSMS_N">보내지 않음</label>
                </div>
              </li>
              <li><span className="title">퇴실문자</span>
                <div className="filter-radio justify-center">
                  <input type="radio" name="rdoSetCheckOutSMSYN" value="Y" id="rdoSetCheckOutSMS_Y" defaultChecked />
                  <label htmlFor="rdoSetCheckOutSMS_Y">보냄</label>
                  <input type="radio" name="rdoSetCheckOutSMSYN" value="N" id="rdoSetCheckOutSMS_N" />
                  <label htmlFor="rdoSetCheckOutSMS_N">보내지 않음</label>
                </div>
              </li>
            </ul>
            <ul className="explain-list bw6 mt-16">
              <li>출결키패드 이용 시 학생의 입/퇴실 문자가 보내지길 원하시면 보냄 설정을 하시기 바랍니다.</li>
              <li>휴대폰에 메타문자가 로그인 되어야 정상 발송됩니다.</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__line--small button__line--white button__weight--medium" onClick={onClose}>취소</button>
            <button type="button" style={{ minWidth: 64 }} className="button__fill button__fill--small button__fill--secondary" onClick={ok}>확인</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}

/** 원본 #modalSendText 마크업 그대로 (출결 문자 전송) */
function SendTextModal({ count, onClose }: { count: number; onClose: () => void }) {
  const ok = async () => { onClose(); await metaAlert("준비 중입니다."); };
  return (
    <>
      <div className="modal modal--xsmall max-400 fade show" id="modalSendText" tabIndex={-1} role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">출결 문자 전송</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button></div>
          <div className="modal-body text-center pl-40 pr-40">
            <p>선택된 <span className="s300" id="modalSMSTargetCnt">{count}건</span>에 대하여 문자를 전송하시겠습니까?</p>
            <div className="filter-radio justify-center mt-16">
              <input type="radio" name="rdoSMSSendType" id="rdoSMSSendTypeIn" value="MTIN" defaultChecked />
              <label htmlFor="rdoSMSSendTypeIn">입실문자</label>
              <input type="radio" name="rdoSMSSendType" id="rdoSMSSendTypeOt" value="MTOT" />
              <label htmlFor="rdoSMSSendTypeOt">퇴실문자</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel" onClick={onClose}>취소</button>
            <button type="button" className="submit" onClick={ok}>확인</button>
          </div>
        </div></div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
