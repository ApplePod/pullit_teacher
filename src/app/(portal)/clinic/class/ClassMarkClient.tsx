"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";
import { OriginalModal, BTN_CANCEL } from "@/components/portal/OriginalModal";
import { cancelMarking, listClassAssignments, makeWrongPaper, trashAssignments, type ClassAsgRow } from "../clinicActions";
import { CLASS_FILTER_HTML } from "../studentmark/filterHtml";
import { ClinicHeader, DurationCell, EMPTY_FILTER, fmtD, ListFoot, OriginalFilter, Tagline, usePaging, type FilterState } from "../studentmark/listCommon";
import { MarkSheetModal } from "../studentmark/MarkSheetModal";

/** 원본 Pages/Center/Clinic/class.cshtml 마크업 그대로 + 실데이터·동작 */
export function ClassMarkClient() {
  const [rows, setRows] = useState<ClassAsgRow[]>([]);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openRow, setOpenRow] = useState<ClassAsgRow | null>(null);
  const [marking, setMarking] = useState<{ asId: string; name: string } | null>(null);
  const [pending, start] = useTransition();
  const layer = useLayerPopup();
  const { page, setPage, size, setSize, view } = usePaging(rows);

  const load = useCallback((f: FilterState) => start(async () => {
    setRows(await listClassAssignments({
      dateField: f.dateField, start: f.start, end: f.end, searchField: f.searchField, keyword: f.keyword,
      band: f.band, markYn: f.markYn, enoteYn: f.enoteYn, tag: f.tag,
    }));
  }), []);
  useEffect(() => { load(filter); }, [filter, load]);

  const sel = [...checked];
  const selRows = rows.filter((r) => checked.has(r.assignment_id));
  const paperIds = [...new Set(selRows.map((r) => r.paper_id))];
  const selAsIds = selRows.flatMap((r) => r.students.map((s) => s.as_id));
  const needSel = async () => { if (sel.length === 0) { await metaAlert("목록에서 반을 선택해 주세요."); return false; } return true; };
  const reload = () => { setChecked(new Set()); load(filter); };
  // 원본 반별 목록은 라디오(한 줄만) 선택이다 — selectRadio
  const select = (id: string) => setChecked(new Set([id]));
  const canEnote = (r: ClassAsgRow) => r.marked > 0 && r.wrong_count > 0 && !r.enote_done;
  const rowWrong = async (r: ClassAsgRow) => {
    select(r.assignment_id);
    const res = await makeWrongPaper(r.students.filter((s) => s.status === "marked").map((s) => s.as_id), true);
    if (res.error) { await metaAlert(res.error); return; }
    if (res.created === 0) { await metaAlert("채점이 완료된 문제지 중 오답이 있는 항목을 선택해 주세요."); return; }
    await metaAlert(`오답 문제지 ${res.created}개를 만들어 학생에게 배정했습니다.`);
    reload();
  };

  const onWrong = (assign: boolean) => async () => {
    if (!(await needSel())) return;
    const r = await makeWrongPaper(selAsIds, assign);
    if (r.error) { await metaAlert(r.error); return; }
    if (r.created === 0) { await metaAlert("채점이 완료된 문제지 중 오답이 있는 항목을 선택해 주세요."); return; }
    await metaAlert(assign ? `오답 문제지 ${r.created}개를 만들어 학생에게 배정했습니다.` : `오답모음 문제지 ${r.created}개를 만들었습니다.`);
    reload();
  };
  const onDelete = async () => {
    if (!(await needSel())) return;
    if (!(await metaConfirm("선택한 문제지를 삭제하시겠습니까?"))) return;
    const r = await trashAssignments({ assignmentIds: sel });
    if (r.error) { await metaAlert(r.error); return; }
    reload();
  };

  return (
    <>
      <ClinicHeader />
      <div className="contens-body">
      {layer.popup}
      <ListTab tabs={CLINIC_TABS} tablist />
      <p className="alert-orange mt-24 mb-12">&#39;반별 선택&#39;으로 배정한 문제지를 목록에서 선택하여 채점합니다. </p>
      <div className="tab-content">
        <div className="tab-pane fade active show" id="tab-pane-2-2" role="tabpanel" tabIndex={0}>
          <OriginalFilter html={CLASS_FILTER_HTML} storeKey="class" onChange={setFilter} />
        </div>
        <div className="category-btns mt-24">
          <div className="left-area">
            <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) setOpenRow(selRows[0]); }}>채점</button>
            <button type="button" className="category-btns-item f-12" onClick={onWrong(false)}>오답모음생성</button>
            <button type="button" className="category-btns-item f-12" onClick={onWrong(true)}>오답출제</button>
            <button type="button" className="category-btns-item f-12" onClick={async () => { if (await needSel()) layer.open(`/popup/paper/preview?ids=${paperIds.join(",")}&print=1`); }}>인쇄</button>
            <button type="button" className="category-btns-item f-12" onClick={onDelete}>삭제</button>
            <button type="button" className="category-btns-item f-12" onClick={() => metaAlert("준비 중입니다.")}><i className="fa-sharp fa-solid fa-download" aria-hidden="true"></i>엑셀다운</button>
          </div>
        </div>
        <div className="list-basic-check mt-8">
          <ul className="table-head gap-2">
            <li style={{ maxWidth: 20 }}></li>
            <li className="title-line">문제지명</li>
            <li className="" style={{ maxWidth: 94 }}>반 명</li>
            <li className="" style={{ maxWidth: 64 }}>학습가능기간</li>
            <li className="" style={{ maxWidth: 56 }}> 배정일 <br /> 채점일 </li>
            <li className="align-items-center" style={{ maxWidth: 78 }}>채점/미채점</li>
            <li className="align-items-center" style={{ maxWidth: 68 }}>오답출제</li>
            <li className="align-items-center" style={{ maxWidth: 68 }}>학생홈발송</li>
          </ul>
          {view.map((r) => (
            <ul key={r.assignment_id} className="table-body gap-2 table-hover-background" onClick={() => select(r.assignment_id)}>
              <li className="check-block" style={{ maxWidth: 20 }}>
                <input type="radio" name="rdoClsMarkingid" id={`rdoPaperId_${r.paper_id}`} className="form-check-input"
                  value={r.assignment_id} checked={checked.has(r.assignment_id)} onChange={() => select(r.assignment_id)} onClick={(e) => e.stopPropagation()} />
              </li>
              <li className="title-line">
                <div className="d-flex gap-1">
                  <span className="badge-alram">{r.total}</span>
                  <div className="left">
                    <a href="javascript:;" data-bs-toggle="tooltip" data-bs-placement="top" className="line-clamp-1 title-tooltip"
                      onClick={(e) => { e.preventDefault(); select(r.assignment_id); layer.open(`/popup/paper/preview?ids=${r.paper_id}`); }}>{r.paper_name}</a>
                    <Tagline paperType={r.paper_type} tags={r.tags} count={r.problem_count} maker={r.maker} />
                  </div>
                </div>
              </li>
              <li className="bw10" style={{ maxWidth: 100 }}>
                <a href="javascript:void(0)" data-bs-toggle="tooltip" data-bs-placement="top" title={r.students.map((st) => st.student_name).join(", ")}
                  className="d-flex gap-1 align-items-center justify-content-center tooltip-title">
                  <span style={{ maxWidth: 98, whiteSpace: "nowrap" }} className="d-block line-clamp-1 f-12 namewrap">{r.class_name}</span>
                  <i className="fa-sharp-duotone fa-solid fa-chalkboard-user f-12" aria-hidden="true"></i>
                </a>
              </li>
              <li className="bw10" style={{ maxWidth: 64 }}><DurationCell from={r.assigned_at} to={r.due_at} editable={r.marked < r.total} /></li>
              <li className="bw10" style={{ maxWidth: 56 }}>{fmtD(r.assigned_at)} <br /> {r.marked_at ? fmtD(r.marked_at) : "-"}</li>
              <li className="bw10 align-items-center" style={{ maxWidth: 78 }}>
                {r.marked === 0
                  ? <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => { select(r.assignment_id); setOpenRow(r); }}>미채점</button>
                  : <a href="javascript:;" className="btn-underline f-12" onClick={(e) => { e.preventDefault(); select(r.assignment_id); setOpenRow(r); }}>{r.marked}/{r.total - r.marked}</a>}
              </li>
              <li className="bw6 align-items-center" style={{ maxWidth: 68 }}>
                {canEnote(r)
                  ? <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => rowWrong(r)}>오답출제</button>
                  : "불가"}
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
      {openRow && !marking && (
        <OriginalModal id="divClassMark" size="max-680" title={<>{openRow.class_name} · {openRow.paper_name}</>}
          onClose={() => setOpenRow(null)}
          footer={<button type="button" className={BTN_CANCEL} onClick={() => setOpenRow(null)}>닫기</button>}>
          <p className="f-14 mb-16">채점할 학생을 선택해 주세요.</p>
          <div className="list-basic-check pt-0 shadow-none">
            <ul className="table-head gap-3">
              <li className="title-line">학생명</li>
              <li className="align-items-center" style={{ maxWidth: 90 }}>정/오(점수)</li>
              <li className="align-items-center" style={{ maxWidth: 80 }}>채점</li>
            </ul>
            {openRow.students.map((s) => (
              <ul key={s.as_id} className="table-body gap-3 table-hover-background">
                <li className="title-line">{s.student_name}</li>
                <li className="align-items-center" style={{ maxWidth: 90 }}>
                  {s.status === "marked" ? `${s.correct_count}/${openRow.problem_count}(${s.score ?? 0}점)` : "미채점"}
                </li>
                <li className="align-items-center" style={{ maxWidth: 80 }}>
                  <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100"
                    onClick={() => setMarking({ asId: s.as_id, name: s.student_name })}>{s.status === "marked" ? "재채점" : "채점"}</button>
                  {s.status === "marked" && (
                    <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100 mt-4"
                      onClick={async () => {
                        if (!(await metaConfirm("선택한 학생의 채점을 취소하시겠습니까?"))) return;
                        await cancelMarking([s.as_id]);
                        setOpenRow(null); reload();
                      }}>채점취소</button>
                  )}
                </li>
              </ul>
            ))}
            {openRow.students.length === 0 && <div className="null-item">배정된 학생이 없습니다.</div>}
          </div>
        </OriginalModal>
      )}
      {marking && <MarkSheetModal asId={marking.asId} studentName={marking.name} onClose={() => setMarking(null)} onDone={() => { setMarking(null); setOpenRow(null); reload(); }} />}
      </div>
    </>
  );
}
