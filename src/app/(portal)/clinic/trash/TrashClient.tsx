"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { useLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert } from "@/components/portal/MetaModal";
import { listClinicTrash, trashAssignments, type TrashRow } from "../clinicActions";
import { TRASH_FILTER_HTML } from "../studentmark/filterHtml";
import { EMPTY_FILTER, fmtD, ListFoot, OriginalFilter, Tagline, usePaging, type FilterState } from "../studentmark/listCommon";

/** 원본 Pages/Center/Clinic/trash.cshtml 마크업 그대로 + 실데이터·동작 */
export function TrashClient() {
  const [rows, setRows] = useState<TrashRow[]>([]);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const layer = useLayerPopup();
  const { page, setPage, size, setSize, view } = usePaging(rows);

  const load = useCallback((f: FilterState) => start(async () => {
    setRows(await listClinicTrash({ dateField: f.dateField, start: f.start, end: f.end, searchField: f.searchField, keyword: f.keyword, tag: f.tag }));
  }), []);
  useEffect(() => { load(filter); }, [filter, load]);

  const reload = () => { setChecked(new Set()); load(filter); };
  const toggle = (k: string) => setChecked((c) => { const n = new Set(c); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const restore = async (list: TrashRow[]) => {
    const r = await trashAssignments({
      asIds: list.filter((x) => x.kind === "student").map((x) => x.as_id),
      assignmentIds: list.filter((x) => x.kind === "class").map((x) => x.assignment_id),
    }, true);
    if (r.error) { await metaAlert(r.error); return; }
    await metaAlert("복원되었습니다.");
    reload();
  };

  return (
    <div className="contens-body">
      {layer.popup}
      <ListTab tabs={CLINIC_TABS} />
      <div className="tab-content">
        <div className="tab-pane fade active show" id="tab-pane-2-1" role="tabpanel" tabIndex={0}>
          <OriginalFilter html={TRASH_FILTER_HTML} storeKey="clinic-trash" onChange={setFilter} />
          <div className="category-btns mt-24 mb-8">
            <div className="left-area">
              <button type="button" className="category-btns-item f-12" onClick={async () => {
                const list = rows.filter((r) => checked.has(r.key));
                if (list.length === 0) { await metaAlert("목록에서 문제지를 선택해 주세요."); return; }
                await restore(list);
              }}>복원하기</button>
            </div>
          </div>
          <div className="list-basic-check mt-8">
            <ul className="table-head gap-3">
              <li style={{ maxWidth: 20 }}>
                <input type="checkbox" className="form-check-input" id="selectAll"
                  checked={view.length > 0 && view.every((r) => checked.has(r.key))}
                  onChange={(e) => setChecked(e.target.checked ? new Set(view.map((r) => r.key)) : new Set())} />
              </li>
              <li className="title-line">문제지명</li>
              <li className="" style={{ maxWidth: 68 }}>학생/반 명</li>
              <li className="" style={{ maxWidth: 64 }}>학습가능기간</li>
              <li className="" style={{ maxWidth: 56 }}> 배정일 <br /> 채점일 </li>
              <li className="align-items-center" style={{ maxWidth: 68 }}>학생홈발송</li>
              <li className="align-items-center" style={{ maxWidth: 68 }}>복원</li>
            </ul>
            {view.map((r) => (
              <ul key={r.key} className="table-body gap-3 table-hover-background">
                <li className="check-block" style={{ maxWidth: 20 }}>
                  <input type="checkbox" name="chkPaperId" className="form-check-input" value={r.key} checked={checked.has(r.key)} onChange={() => toggle(r.key)} />
                </li>
                <li className="title-line">
                  <div className="d-flex gap-1"><div className="left">
                    <div className="d-flex title-line">
                      <a href="javascript:void(0)" className="line-clamp-1 title-tooltip" title={r.paper_name}
                        onClick={(e) => { e.preventDefault(); layer.open(`/popup/paper/preview?ids=${r.paper_id}`); }}>{r.paper_name}</a>
                      {r.kind === "class" && <span className="badge-alram">반</span>}
                    </div>
                    <Tagline paperType={r.paper_type} tags={[]} count={r.problem_count} maker={r.maker} />
                  </div></div>
                </li>
                <li className="bw10" style={{ maxWidth: 68 }}><span className="line-clamp-2">{r.target_name}</span></li>
                <li className="bw10" style={{ maxWidth: 64 }}><span>{fmtD(r.assigned_at)}<br />~{fmtD(r.due_at)}</span></li>
                <li className="bw10" style={{ maxWidth: 56 }}>{fmtD(r.assigned_at)} <br /> {r.marked_at ? fmtD(r.marked_at) : "-"}</li>
                <li className="bw6 align-items-center" style={{ maxWidth: 68 }}>-</li>
                <li className="bw6 align-items-center" style={{ maxWidth: 68 }}>
                  <button type="button" className="button__fill button__line--xsmall button__line--white bw10 w-100" onClick={() => restore([r])}>복원</button>
                </li>
              </ul>
            ))}
            {rows.length === 0 && <div className="null-item">{pending ? "불러오는 중…" : "등록된 내역이 없습니다."}</div>}
          </div>
          <ListFoot total={rows.length} size={size} setSize={setSize} page={page} setPage={setPage} />
        </div>
      </div>
    </div>
  );
}
