"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { OriginalModal, BTN_APPLY, BTN_CANCEL } from "@/components/portal/OriginalModal";
import {
  createAnalysisReports, deleteAnalysisReports, listAnalysisReports, markAnalysisSent, studentReport, updateAnalysisReport,
  type AnalysisRow, type ReportRow,
} from "../clinicActions";
import { REPORT_FILTER_HTML } from "../studentmark/filterHtml";
import { EMPTY_FILTER, fmtD, ListFoot, OriginalFilter, usePaging, type FilterState } from "../studentmark/listCommon";
import { GRADE_LABEL } from "@/lib/mgmt-consts";

const KINDS: [string, string][] = [
  ["R201", "종합학습분석표"], ["R202", "교재별분석표"], ["R205", "오답학습분석표"], ["R206", "프리미엄교재학습분석표"],
  ["R211", "성취도분석표"], ["R212", "진단평가분석표"], ["R213", "일일평가분석표"],
];

/** 원본 Pages/Center/Clinic/report.cshtml 마크업 그대로 + 실데이터·동작 */
export function ReportClient() {
  const [rows, setRows] = useState<AnalysisRow[]>([]);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [make, setMake] = useState(false);
  const [edit, setEdit] = useState<AnalysisRow | null>(null);
  const [print, setPrint] = useState<AnalysisRow[] | null>(null);
  const [pending, start] = useTransition();
  const { page, setPage, size, setSize, view } = usePaging(rows);

  const load = useCallback((f: FilterState) => start(async () => {
    setRows(await listAnalysisReports({ start: f.start, end: f.end, searchField: f.searchField, keyword: f.keyword, code: f.code, homeYn: f.homeYn, kakaoYn: f.kakaoYn, smsYn: f.smsYn }));
  }), []);
  useEffect(() => { load(filter); }, [filter, load]);

  const sel = [...checked];
  const selRows = rows.filter((r) => checked.has(r.id));
  const needSel = async () => { if (sel.length === 0) { await metaAlert("목록에서 분석표를 선택해 주세요."); return false; } return true; };
  const reload = () => { setChecked(new Set()); load(filter); };
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const send = async (ids: string[], ch: "home" | "sms" | "kakao") => {
    const r = await markAnalysisSent(ids, ch);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert(ch === "home" ? "학생홈으로 발송했습니다." : ch === "sms" ? "문자발송을 요청했습니다." : "카카오톡으로 발송했습니다.");
    reload();
  };

  return (
    <div className="contens-body">
      <ListTab tabs={CLINIC_TABS} />
      <p className="alert-orange mt-24 mb-12">학습 기간별 종합학습분석표, 교재별분석표, 평가 분석표를 만들어 수정, 인쇄, 발송합니다.</p>
      <div className="tab-content">
        <div className="tab-pane fade active show" id="tab-pane-2-4" role="tabpanel" tabIndex={0}>
          <OriginalFilter html={REPORT_FILTER_HTML} storeKey="report" onChange={setFilter} />
          <div className="category-btns mt-24">
            <div className="left-area">
              <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) setEdit(selRows[0]); }}>수정</button>
              <button type="button" className="category-btns-item f-12" onClick={async () => {
                if (!(await needSel())) return;
                if (!(await metaConfirm("선택한 분석표를 삭제하시겠습니까?"))) return;
                const r = await deleteAnalysisReports(sel); if (r.error) { await metaAlert(r.error); return; } reload();
              }}>삭제</button>
              <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) setPrint(selRows); }}>인쇄</button>
              <button type="button" className="category-btns-item fill f-12" onClick={async () => { if (await needSel()) await send(sel, "home"); }}>학생홈 발송</button>
              <button type="button" className="category-btns-item fill f-12" onClick={async () => { if (await needSel()) await send(sel, "sms"); }}>문자발송 요청</button>
            </div>
            <div className="right-area">
              <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => setMake(true)}>
                <i className="fa-sharp fa-regular fa-pencil-mechanical" aria-hidden="true"></i> 분석표 만들기 </button>
            </div>
          </div>
          <div className="list-basic-check mt-8">
            <ul className="table-head gap-4-5">
              <li style={{ maxWidth: 20 }}>
                <input type="checkbox" className="form-check-input" id="selectAll"
                  checked={view.length > 0 && view.every((r) => checked.has(r.id))}
                  onChange={(e) => setChecked(e.target.checked ? new Set(view.map((r) => r.id)) : new Set())} />
              </li>
              <li className="title-line">분석표명</li>
              <li className="" style={{ maxWidth: 48 }}>학생</li>
              <li className="" style={{ maxWidth: 64 }}>분석기간</li>
              <li className="" style={{ maxWidth: 56 }}>등록일</li>
              <li className="align-items-center" style={{ maxWidth: 78 }}>학생홈</li>
              <li className="align-items-center" style={{ maxWidth: 78 }}>문자발송 요청</li>
              <li className="align-items-center" style={{ maxWidth: 78 }}>카카오톡</li>
            </ul>
            {view.map((r) => (
              <ul key={r.id} className="table-body gap-4-5 table-hover-background">
                <li className="check-block" style={{ maxWidth: 20 }}>
                  <input type="checkbox" name="chkReportId" className="form-check-input" value={r.id} checked={checked.has(r.id)} onChange={() => toggle(r.id)} />
                </li>
                <li className="title-line">
                  <div className="d-flex gap-1"><div className="left">
                    <div className="d-flex title-line">
                      <a href="javascript:void(0)" className="line-clamp-1 title-tooltip" title={r.name} onClick={(e) => { e.preventDefault(); setPrint([r]); }}>{r.name}</a>
                    </div>
                    <div className="d-flex tagline">
                      <p>{r.label}</p><p>채점 {r.stats.marked}건</p><p>평균 {r.stats.avg_score ?? 0}점</p><p>오답 {r.stats.wrong}문항</p>
                    </div>
                  </div></div>
                </li>
                <li className="bw10" style={{ maxWidth: 48 }}><span className="line-clamp-2">{r.student_name}</span></li>
                <li className="bw10" style={{ maxWidth: 64 }}><span>{fmtD(r.period_start)}<br />~{fmtD(r.period_end)}</span></li>
                <li className="bw10" style={{ maxWidth: 56 }}>{fmtD(r.created_at)}</li>
                <li className="bw10 align-items-center" style={{ maxWidth: 78 }}>
                  {r.home_sent_at ? fmtD(r.home_sent_at)
                    : <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => send([r.id], "home")}>발송</button>}
                </li>
                <li className="bw10 align-items-center" style={{ maxWidth: 78 }}>
                  {r.sms_req_at ? fmtD(r.sms_req_at)
                    : <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => send([r.id], "sms")}>요청</button>}
                </li>
                <li className="bw10 align-items-center" style={{ maxWidth: 78 }}>
                  {r.kakao_sent_at ? fmtD(r.kakao_sent_at)
                    : <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => send([r.id], "kakao")}>발송</button>}
                </li>
              </ul>
            ))}
            {rows.length === 0 && <div className="null-item">{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</div>}
          </div>
          <ListFoot total={rows.length} size={size} setSize={setSize} page={page} setPage={setPage} />
        </div>
      </div>
      {make && <MakeReportModal onClose={() => setMake(false)} onDone={() => { setMake(false); reload(); }} />}
      {edit && <EditReportModal row={edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); reload(); }} />}
      {print && <PrintReportModal rows={print} onClose={() => setPrint(null)} />}
    </div>
  );
}

/** 분석표 만들기 */
function MakeReportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [students, setStudents] = useState<ReportRow[]>([]);
  const [chk, setChk] = useState<Set<string>>(new Set());
  const [code, setCode] = useState("R201");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { studentReport().then(setStudents); }, []);
  const submit = async () => {
    if (chk.size === 0) { await metaAlert("학생을 선택해주세요"); return; }
    setBusy(true);
    const r = await createAnalysisReports({ student_ids: [...chk], code, label: KINDS.find(([c]) => c === code)?.[1] ?? "종합학습분석표", start: startAt, end: endAt });
    setBusy(false);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert(`분석표 ${r.created}개를 만들었습니다.`);
    onDone();
  };
  return (
    <OriginalModal id="analysisReport01" size="max-680" title="학생별 학습 분석 보고서" onClose={onClose}
      footer={<>
        <button type="button" className={BTN_CANCEL} onClick={onClose}>닫기</button>
        <button type="button" className={BTN_APPLY} onClick={submit} disabled={busy}>분석표 만들기</button>
      </>}>
      <div className="d-flex gap-1 mb-16 align-items-center">
        <div className="select__small"><select value={code} onChange={(e) => setCode(e.target.value)}>{KINDS.map(([c, l]) => <option key={c} value={c}>{l}</option>)}</select></div>
        <div className="duration">
          <div className="position-relative"><input type="date" className="startDate" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></div>
          <span className="between">-</span>
          <div className="position-relative"><input type="date" className="endDate" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></div>
        </div>
      </div>
      <div className="list-basic-check pt-0 shadow-none">
        <ul className="table-head gap-3">
          <li style={{ maxWidth: 20 }}>
            <input className="form-check-input" type="checkbox" id="stdselectAll"
              checked={students.length > 0 && chk.size === students.length}
              onChange={(e) => setChk(e.target.checked ? new Set(students.map((s) => s.student_id)) : new Set())} />
          </li>
          <li className="title-line">학생명</li>
          <li style={{ maxWidth: 60 }}>학년</li>
          <li style={{ maxWidth: 60 }}>채점</li>
          <li style={{ maxWidth: 60 }}>평균</li>
        </ul>
        {students.map((s) => (
          <ul key={s.student_id} className="table-body gap-3 table-hover-background">
            <li style={{ maxWidth: 20 }}>
              <input type="checkbox" className="form-check-input" name="chkUserId" checked={chk.has(s.student_id)}
                onChange={() => setChk((c) => { const n = new Set(c); if (n.has(s.student_id)) n.delete(s.student_id); else n.add(s.student_id); return n; })} />
            </li>
            <li className="title-line">{s.student_name}</li>
            <li style={{ maxWidth: 60 }}>{GRADE_LABEL[s.grade] ?? s.grade}</li>
            <li style={{ maxWidth: 60 }}>{s.marked}/{s.assigned}</li>
            <li style={{ maxWidth: 60 }}>{s.avg_score != null ? `${s.avg_score}점` : "-"}</li>
          </ul>
        ))}
        {students.length === 0 && <div className="null-item">등록된 학생이 없습니다.</div>}
      </div>
    </OriginalModal>
  );
}

/** 분석표 수정 */
function EditReportModal({ row, onClose, onDone }: { row: AnalysisRow; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(row.name);
  const [startAt, setStartAt] = useState(row.period_start ?? "");
  const [endAt, setEndAt] = useState(row.period_end ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <OriginalModal id="analysisReportEdit" size="max-450" title="분석표 수정" onClose={onClose}
      footer={<>
        <button type="button" className={BTN_CANCEL} onClick={onClose}>취소</button>
        <button type="button" className={BTN_APPLY} disabled={busy} onClick={async () => {
          if (!name.trim()) { await metaAlert("분석표명을 입력해 주세요."); return; }
          setBusy(true); const r = await updateAnalysisReport(row.id, { name, start: startAt, end: endAt }); setBusy(false);
          if (r.error) { await metaAlert(r.error); return; }
          onDone();
        }}>저장</button>
      </>}>
      <div className="input-item mb-16"><label className="f-14 fw-600 mb-8 d-block">분석표명</label>
        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="input-item"><label className="f-14 fw-600 mb-8 d-block">분석기간</label>
        <div className="duration">
          <div className="position-relative"><input type="date" className="startDate" value={startAt} onChange={(e) => setStartAt(e.target.value)} /></div>
          <span className="between">-</span>
          <div className="position-relative"><input type="date" className="endDate" value={endAt} onChange={(e) => setEndAt(e.target.value)} /></div>
        </div>
      </div>
    </OriginalModal>
  );
}

/** 분석표 인쇄 (브라우저 인쇄) */
function PrintReportModal({ rows, onClose }: { rows: AnalysisRow[]; onClose: () => void }) {
  return (
    <OriginalModal id="analysisReportPrint" size="max-680" title="분석표 인쇄" onClose={onClose}
      footer={<>
        <button type="button" className={BTN_CANCEL} onClick={onClose}>닫기</button>
        <button type="button" className={BTN_APPLY} onClick={() => window.print()}>인쇄</button>
      </>}>
      {rows.map((r) => (
        <div key={r.id} className="mb-24">
          <h6 className="f-14 fw-700 mb-8">{r.name}</h6>
          <div className="d-flex tagline mb-8"><p>{r.label}</p><p>{r.student_name}</p><p>{fmtD(r.period_start)} ~ {fmtD(r.period_end)}</p></div>
          <div className="list-basic-check pt-0 shadow-none">
            <ul className="table-head gap-3"><li className="title-line">항목</li><li className="align-items-center" style={{ maxWidth: 120 }}>값</li></ul>
            <ul className="table-body gap-3"><li className="title-line">배정 문제지</li><li className="align-items-center" style={{ maxWidth: 120 }}>{r.stats.assigned}건</li></ul>
            <ul className="table-body gap-3"><li className="title-line">채점 완료</li><li className="align-items-center" style={{ maxWidth: 120 }}>{r.stats.marked}건</li></ul>
            <ul className="table-body gap-3"><li className="title-line">평균 점수</li><li className="align-items-center" style={{ maxWidth: 120 }}>{r.stats.avg_score ?? 0}점</li></ul>
            <ul className="table-body gap-3"><li className="title-line">오답 문항</li><li className="align-items-center" style={{ maxWidth: 120 }}>{r.stats.wrong}문항</li></ul>
          </div>
        </div>
      ))}
    </OriginalModal>
  );
}
