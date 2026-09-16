"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { cancelMarking, listStudentAssignments, makeWrongPaper, trashAssignments, type StudentAsgRow } from "../clinicActions";
import { STUDENTMARK_FILTER_HTML } from "./filterHtml";
import { ClinicHeader, DurationCell, EMPTY_FILTER, fmtD, ListFoot, OriginalFilter, Tagline, usePaging, type FilterState } from "./listCommon";
import { MarkSheetModal } from "./MarkSheetModal";

/** 원본 Pages/Center/Clinic/studentmark.cshtml 마크업 그대로 + 실데이터·동작 */
export function StudentMarkClient({ initialRows = [] }: { initialRows?: StudentAsgRow[] }) {
  const [rows, setRows] = useState<StudentAsgRow[]>(initialRows);
  const first = useRef(true);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState<StudentAsgRow | null>(null);
  const [pending, start] = useTransition();
  const layer = useLayerPopup();
  const { page, setPage, size, setSize, view } = usePaging(rows);

  const load = useCallback((f: FilterState) => start(async () => {
    setRows(await listStudentAssignments({
      dateField: f.dateField, start: f.start, end: f.end, searchField: f.searchField, keyword: f.keyword,
      band: f.band, markYn: f.markYn, enoteYn: f.enoteYn, tag: f.tag,
    }));
  }), []);
  // 첫 렌더는 서버가 내려준 목록을 그대로 쓰고, 필터가 바뀔 때만 다시 조회
  useEffect(() => { if (first.current) { first.current = false; return; } load(filter); }, [filter, load]);

  const sel = [...checked];
  const selRows = rows.filter((r) => checked.has(r.as_id));
  const paperIds = [...new Set(selRows.map((r) => r.paper_id))];
  const needSel = async () => { if (sel.length === 0) { await metaAlert("목록에서 문제지를 선택해 주세요."); return false; } return true; };
  const reload = () => { setChecked(new Set()); load(filter); };
  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const enoteLabel = (r: StudentAsgRow) => (r.enote_done ? "완료" : r.status === "marked" && r.wrong_count > 0 ? "오답출제" : "불가");

  const onWrong = (assign: boolean) => async () => {
    if (!(await needSel())) return;
    const r = await makeWrongPaper(sel, assign);
    if (r.error) { await metaAlert(r.error); return; }
    if (r.created === 0) { await metaAlert("채점이 완료된 문제지 중 오답이 있는 항목을 선택해 주세요."); return; }
    await metaAlert(assign ? `오답 문제지 ${r.created}개를 만들어 학생에게 배정했습니다.` : `오답모음 문제지 ${r.created}개를 만들었습니다.`);
    reload();
  };
  const onCancelMark = async () => {
    if (!(await needSel())) return;
    const target = selRows.filter((r) => r.status === "marked").map((r) => r.as_id);
    if (target.length === 0) { await metaAlert("채점이 완료된 문제지를 선택해 주세요."); return; }
    if (!(await metaConfirm("선택한 문제지의 채점을 취소하시겠습니까?"))) return;
    const r = await cancelMarking(target);
    if (r.error) { await metaAlert(r.error); return; }
    reload();
  };
  const onDelete = async () => {
    if (!(await needSel())) return;
    if (!(await metaConfirm("선택한 문제지를 삭제하시겠습니까?"))) return;
    const r = await trashAssignments({ asIds: sel });
    if (r.error) { await metaAlert(r.error); return; }
    reload();
  };

  return (
    <>
      <ClinicHeader />
      <div className="contens-body">
      {layer.popup}
      <ListTab tabs={CLINIC_TABS} tablist />
      <p className="alert-orange mt-24 mb-12">&#39;학생별 선택&#39;으로 배정한 문제지를 목록에서 선택하여 채점합니다.</p>
      <div className="tab-content">
        <div className="tab-pane fade active show" id="tab-pane-2-1" role="tabpanel" tabIndex={0}>
          <OriginalFilter html={STUDENTMARK_FILTER_HTML} storeKey="studentmark" onChange={setFilter} />
          <div className="category-btns mt-24">
            <div className="left-area">
              <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/assign?ids=${paperIds.join(",")}`); }}>학생 배정</button>
              <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) setMarking(selRows[0]); }}>채점</button>
              <button type="button" className="category-btns-item f-12" onClick={onWrong(false)}>오답모음생성</button>
              <button type="button" className="category-btns-item f-12" onClick={onWrong(true)}>오답출제</button>
              <button type="button" className="category-btns-item f-12" onClick={onCancelMark}>채점 취소</button>
              <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/preview?ids=${paperIds.join(",")}&print=1`); }}>인쇄</button>
              <button type="button" className="category-btns-item f-12" onClick={onDelete}>삭제</button>
              <button type="button" className="category-btns-item f-12" onClick={() => metaAlert("준비 중입니다.")}><i className="fa-sharp fa-solid fa-download" aria-hidden="true"></i>엑셀다운</button>
              <button type="button" className="category-btns-item f-12" onClick={() => metaAlert("준비 중입니다.")}>학생홈발송</button>
            </div>
          </div>
          <div className="list-basic-check mt-8">
            <ul className="table-head gap-3">
              <li style={{ maxWidth: 20 }}>
                <input type="checkbox" className="form-check-input" id="selectAll"
                  checked={view.length > 0 && view.every((r) => checked.has(r.as_id))}
                  onChange={(e) => setChecked(e.target.checked ? new Set(view.map((r) => r.as_id)) : new Set())} />
              </li>
              <li className="title-line">문제지명</li>
              <li className="" style={{ maxWidth: 62 }}>학생</li>
              <li className="" style={{ maxWidth: 64 }}>학습가능기간</li>
              <li className="" style={{ maxWidth: 56 }}> 배정일 <br /> 채점일 </li>
              <li className="align-items-center" style={{ maxWidth: 78 }}>정/오(점수)</li>
              <li className="align-items-center" style={{ maxWidth: 40 }}>새창</li>
              <li className="align-items-center" style={{ maxWidth: 68 }}>오답출제</li>
              <li className="align-items-center" style={{ maxWidth: 68 }}>학생홈발송</li>
            </ul>
            {view.map((r) => (
              <ul key={r.as_id} className="table-body gap-3 table-hover-background">
                <li className="check-block" style={{ maxWidth: 20 }}>
                  <input type="checkbox" name="chkPaperId" className="form-check-input" value={r.as_id} checked={checked.has(r.as_id)} onChange={() => toggle(r.as_id)} />
                </li>
                <li className="title-line">
                  <div className="d-flex gap-1"><div className="left">
                    <div className="d-flex title-line">
                      <a href="javascript:void(0)" data-bs-toggle="tooltip" data-bs-placement="top" className="line-clamp-1 title-tooltip" title={r.paper_name}
                        onClick={(e) => { e.preventDefault(); layer.open(`/popup/paper/preview?ids=${r.paper_id}`); }}>{r.paper_name}</a>
                      <span className="badge-alram" style={{ display: "none" }}>반</span>
                    </div>
                    <Tagline grade={r.student_grade} paperType={r.paper_type} tags={r.tags} count={r.problem_count} maker={r.maker} />
                  </div></div>
                </li>
                <li className="bw10" style={{ maxWidth: 62 }}><span className="line-clamp-2">{r.student_name}</span></li>
                <li className="bw10" style={{ maxWidth: 64 }}><DurationCell from={r.assigned_at} to={r.due_at} editable={r.status !== "marked"} /></li>
                <li className="bw10" style={{ maxWidth: 56 }}>{fmtD(r.assigned_at)} <br /> {r.marked_at ? fmtD(r.marked_at) : "-"}</li>
                <li className="bw10 align-items-center" style={{ maxWidth: 78 }}>
                  {r.status === "marked"
                    ? <a href="javascript:;" className="btn-underline f-12" onClick={(e) => { e.preventDefault(); setMarking(r); }}>{r.correct_count}/{r.problem_count}({r.score ?? 0}점)</a>
                    : <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => setMarking(r)}>미채점</button>}
                </li>
                <li className="bw10 align-items-center" style={{ maxWidth: 40 }}>
                  <i className="fa-solid fa-arrow-up-right-from-square f-14" aria-hidden="true"
                    onClick={() => layer.open(`/popup/paper/preview?ids=${r.paper_id}`)}></i>
                </li>
                <li className="bw6 align-items-center" style={{ maxWidth: 68 }}>{enoteLabel(r)}
                  {r.status === "marked" && (
                    <button type="button" className="button__fill button__line--xsmall button__line--white bw10" style={{ width: 60 }}
                      onClick={async () => { if (await metaConfirm("선택한 문제지의 채점을 취소하시겠습니까?")) { await cancelMarking([r.as_id]); reload(); } }}>채점취소</button>
                  )}
                </li>
                <li className="bw6 align-items-center" style={{ maxWidth: 68 }}>
                  <p className="d-flex align-items-center h-32">{fmtD(r.assigned_at)}</p>
                  <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => metaAlert("준비 중입니다.")}>옵션변경</button>
                </li>
              </ul>
            ))}
            {rows.length === 0 && <div className="null-item">{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</div>}
          </div>
          <ListFoot total={rows.length} size={size} setSize={setSize} page={page} setPage={setPage} />
        </div>
      </div>
      {marking && <MarkSheetModal asId={marking.as_id} studentName={marking.student_name} onClose={() => setMarking(null)} onDone={() => { setMarking(null); reload(); }} />}
      </div>
    </>
  );
}
