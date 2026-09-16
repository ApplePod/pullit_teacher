"use client";

import { useEffect, useMemo, useState } from "react";
import { SelectAllCheckbox } from "@/components/portal/SelectAllCheckbox";
import { fmtISO } from "@/lib/date";
import { closeLayerPopup } from "@/components/portal/LayerPopup";
import { metaAlert } from "@/components/portal/MetaModal";
import { assignPaper } from "@/app/(portal)/clinic/clinicActions";
import { listStudentsForAssign, type AsgStudent } from "./assignPopupActions";
import { GRADE_OPTS } from "@/lib/mgmt-consts";

/** 원본 Popup/Assignment.cshtml(#divAssignment 모달) 마크업 그대로 */
export function AssignPopupClient({ paperIds }: { paperIds: string[] }) {
  const [tab, setTab] = useState<"student" | "class">("student");
  const [all, setAll] = useState<AsgStudent[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [state, setState] = useState("MS10"); const [grade, setGrade] = useState(""); const [kw, setKw] = useState(""); const [q, setQ] = useState("");
  const [chk, setChk] = useState<Set<string>>(new Set()); const [cChk, setCChk] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [send, setSend] = useState(false); const [sendDt, setSendDt] = useState(fmtISO()); const [view2, setView2] = useState("N");
  const [busy, setBusy] = useState(false);
  useEffect(() => { listStudentsForAssign().then((r) => { setAll(r.students); setGroups(r.groups); setOpen(new Set(r.groups.map((g) => g.id))); }); }, []);
  const list = useMemo(() => all.filter((s) => (state === "MS10" ? s.state !== "paused" : s.state === "paused") && (!grade || s.grade === grade) && (!q || s.name.includes(q))), [all, state, grade, q]);
  const cList = useMemo(() => list.filter((s) => s.group_id), [list]);
  const submit = async () => {
    const ids = tab === "student" ? [...chk] : [...cChk];
    if (ids.length === 0) { await metaAlert("배정할 학생을 선택해주세요."); return; }
    setBusy(true);
    for (const pid of paperIds) {
      const r = await assignPaper(pid, ids, tab === "class" ? (all.find((s) => s.id === ids[0])?.group_id ?? undefined) : undefined);
      if (r.error) { setBusy(false); await metaAlert(r.error); return; }
    }
    setBusy(false); await metaAlert("배정되었습니다."); closeLayerPopup();
  };
  const row = (s: AsgStudent, sel: Set<string>, setSel: (v: Set<string>) => void, extra?: React.ReactNode) => (
    <ul key={s.id} className="table-body table-hover-background gap-3">
      <li style={{ maxWidth: 20 }}><input type="checkbox" className="form-check-input tree-check" name="chkUserId" checked={sel.has(s.id)} onChange={() => { const n = new Set(sel); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); setSel(n); }} /></li>
      <li className="f-14 bw11 title-line">{s.name}</li>
      <li className="bw11 f-14 justify-content-center text-center">{s.level}</li>
      <li className="bw11 f-14 justify-content-center text-center">{s.grade}</li>{extra}
    </ul>
  );
  return (
    <div className="modal modal-inner-scroll fade modal--small max-680 show" id="divAssignment" tabIndex={-1} style={{ display: "block", position: "static", background: "#fff" }} aria-modal="true" role="dialog">
      <div className="modal-dialog modal-dialog-centered" style={{ margin: 0, maxWidth: "none" }}>
        <div className="modal-content">
          <div className="modal-header"><h6>학생 배정</h6><button type="button" className="btn-close" aria-label="Close" onClick={() => closeLayerPopup()}><span className="material-symbols-sharp">close</span></button></div>
          <div className="modal-body pt-24 pb-24 pl-24 pr-24">
            <h5 className="f-18 mb-16">배정할 학생을 선택해주세요.</h5>
            <ul className="list-tab list-tab--1 mb-16" role="tablist">
              <li className="nav-item" role="presentation"><button className={`nav-link${tab === "student" ? " active" : ""}`} type="button" role="tab" onClick={() => setTab("student")}>학생별 선택</button></li>
              <li className="nav-item" role="presentation"><button className={`nav-link${tab === "class" ? " active" : ""}`} type="button" role="tab" id="btnClass" onClick={() => setTab("class")}>반별 선택</button></li>
            </ul>
            <div className="tab-content position-relative" id="myTabContent">
              <div className="filter-with-tab" style={{ top: -58 }}>
                <div className="select__small"><select value={state} onChange={(e) => setState(e.target.value)}><option value="MS10">정규학생</option><option value="MS01">예비학생</option></select></div>
                <div className="select__small"><select value={grade} onChange={(e) => setGrade(e.target.value)}><option value="">전체</option>{GRADE_OPTS.map(([, nm]) => <option key={nm} value={nm}>{nm}</option>)}</select></div>
                <div className="search-input small"><input type="search" value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQ(kw)} placeholder="이름 검색" /><button type="button" onClick={() => setQ(kw)}>검색</button></div>
              </div>
              {tab === "student" ? (
                <div className="tab-pane fade show active" id="tab-etest-01" role="tabpanel">
                  <p className="f-12 bw5 mt-12 mb-12 fw-400"><i className="fa-sharp fa-regular fa-circle-exclamation bw5" aria-hidden="true"></i> 학생별&#39;에서 학생을 선택하고 문제지를 만들면 채점&amp;클리닉의 &#39;학생별 채점&#39; 목록에서 확인할 수 있습니다.</p>
                  <div className="count-student mb-8"><div className="d-flex align-items-center justify-content-between"><div className="count"><div className="select">{chk.size}명 선택</div> / 총 {list.length}명</div><button type="button" className="reset" onClick={() => setChk(new Set())}>초기화</button></div></div>
                  <div className="list-basic list-basic-filter w-100" style={{ border: 0 }}>
                    <div className="inner-scroll" style={{ height: 360 }}>
                      <ul className="table-head gap-3">
                        <li style={{ maxWidth: 20 }}><SelectAllCheckbox  id="chkAll" className="form-check-input tree-check"   total={list.length} allSelected={chk.size === list.length} onToggle={(v) => setChk(v ? new Set(list.map((s) => s.id)) : new Set())} /></li>
                        <li className="f-14 bw11 title-line">이름</li><li className="bw11 f-14 justify-content-center text-center">레벨</li><li className="bw11 f-14 justify-content-center text-center">학년</li>
                      </ul>
                      {list.map((s) => row(s, chk, setChk))}
                      {list.length <= 0 && <div className="null-item">등록된 내역이 없습니다.</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tab-pane fade show active" id="tab-etest-02" role="tabpanel">
                  <p className="f-12 bw5 mt-12 mb-12 fw-400"><i className="fa-sharp fa-regular fa-circle-exclamation bw5" aria-hidden="true"></i> 반별에서 학생을 선택하고 문제지를 만들면 채점&amp;클리닉의 &#39;반별 채점&#39; 목록에서 확인할 수 있습니다.</p>
                  <div className="count-student mb-8"><div className="d-flex align-items-center justify-content-between"><div className="count"><div className="select">{cChk.size}명 선택</div> / 총 {cList.length}명</div><button type="button" className="reset" onClick={() => setCChk(new Set())}>초기화</button></div></div>
                  <div className="tree_main learning-tree learning-tree--2 child-background-none" style={{ borderRadius: 0 }}>
                    <ul className="learning-tree__header"><li className="title-line">반/이름</li><li style={{ maxWidth: 180, minWidth: 180 }}>레벨</li><li style={{ maxWidth: 100, minWidth: 100 }}>인원/학년</li></ul>
                    <ul className="treeview-container learning-tree__body inner-scroll" style={{ height: 360 }}>
                      {groups.map((g) => { const members = cList.filter((s) => s.group_id === g.id); const allOn = members.length > 0 && members.every((s) => cChk.has(s.id)); return (
                        <li key={g.id}>
                          <div className="line">
                            <span className="tree-toggle material-symbols-sharp" onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); return n; })}>expand_more</span>
                            <input type="checkbox" className="form-check-input tree-check" name="chkboxClassGroup" checked={allOn} onChange={(e) => setCChk((c) => { const n = new Set(c); members.forEach((s) => (e.target.checked ? n.add(s.id) : n.delete(s.id))); return n; })} />
                            <div className="learning-tree__body--list"><div className="learning-tree__body--item bw9 title-line">{g.name}</div><div className="learning-tree__body--item bw9" style={{ maxWidth: 100, minWidth: 100 }}>{members.length}명</div></div>
                          </div>
                          <ul className="sub_ul" style={{ display: open.has(g.id) ? undefined : "none" }}>
                            {members.map((s) => (
                              <li key={s.id}><div className="line">
                                <input type="checkbox" className="form-check-input tree-check" checked={cChk.has(s.id)} onChange={() => setCChk((c) => { const n = new Set(c); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })} />
                                <div className="learning-tree__body--list"><div className="learning-tree__body--item bw9 title-line">{s.name}</div><div className="learning-tree__body--item bw9" style={{ maxWidth: 180, minWidth: 180 }}>{s.level}</div><div className="learning-tree__body--item bw9" style={{ maxWidth: 100, minWidth: 100 }}>{s.grade}</div></div>
                              </div></li>
                            ))}
                          </ul>
                        </li>); })}
                    </ul>
                    {cList.length <= 0 && <div className="null-item" style={{ fontSize: 12 }}>등록된 내역이 없습니다.</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="form-check d-flex gap-1 mt-24"><input type="checkbox" name="user" className="form-check-input" id="checkAll2" checked={send} onChange={(e) => setSend(e.target.checked)} /><label htmlFor="checkAll2" className="form-check-label d-flex flex-column">학생홈으로 발송</label></div>
            {send && (
              <>
                <div className="d-flex gap-3"><div className="duration col"><span className="f-14">학생홈 발송일</span> <input type="date" className="form-control" value={sendDt} onChange={(e) => setSendDt(e.target.value)} style={{ display: "inline-block", width: 160, height: 36 }} /></div></div>
                <div className="mt-16">
                  <div className="d-flex align-items-center justify-between mb-8"><p className="f-14 bw12 fw-700">직접채점 문제지 학생 공개 범위 <i className="fa-sharp fa-solid fa-circle-exclamation bw4" title="학생이 직접 채점 결과를 입력 할 때 ‘OX채점’은 OX입력란만, ‘OX채점+정답’은 접답까지, ‘OX채점+정답·해설’은 정답과 해설까지 모두 보여줘요." aria-hidden="true"></i></p></div>
                  <div className="filter-radio">
                    <input type="radio" name="public-private-2-" id="public-private-2-01" value="N" checked={view2 === "N"} onChange={() => setView2("N")} /><label className="col pl-0 pr-0" htmlFor="public-private-2-01">OX 채점</label>
                    <input type="radio" name="public-private-2-" id="public-private-2-02" value="A" checked={view2 === "A"} onChange={() => setView2("A")} /><label className="col pl-0 pr-0" htmlFor="public-private-2-02">OX 채점+정답</label>
                    <input type="radio" name="public-private-2-" id="public-private-2-03" value="Y" checked={view2 === "Y"} onChange={() => setView2("Y")} /><label className="col pl-0 pr-0" htmlFor="public-private-2-03">OX 채점+정답/해설</label>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel" onClick={() => closeLayerPopup()}>취소</button>
            <button type="button" className="submit" disabled={busy} onClick={submit}>배정하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
