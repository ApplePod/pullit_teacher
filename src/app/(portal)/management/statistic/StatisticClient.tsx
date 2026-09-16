"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { metaAlert } from "@/components/portal/MetaModal";
import { loadStatistic, type StatData, type StatQuad, type StatRow } from "./statActions";

const MENUS = ["교과학습", "교재매칭", "일일평가", "진단평가", "성취도 평가", "수능·모의고사 기출", "오답집중학습", "유형집중학습", "총 합계"];
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];
const EMPTY: StatData = { teachers: [], classes: [], teacherSummary: {}, classSummary: {}, teacherRows: {}, classRows: {}, classBooks: [] };

const pct = (n: number | null) => (n == null ? "0.0%" : `${n.toFixed(1)}%`);
const rate = (q: StatQuad) => (q.assigned ? (q.marked / q.assigned) * 100 : 0);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sum = (rows: StatRow[], g: number, f: (q: StatQuad) => number) => rows.reduce((a, r) => a + f(r.groups[g]), 0);

/** 원본 학습현황(statistic.cshtml) 마크업 그대로 + 우리 데이터 */
export function StatisticClient() {
  const [pane, setPane] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<StatData>(EMPTY);
  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [menu, setMenu] = useState(MENUS[0]);
  const [, start] = useTransition();

  const load = useCallback((f: string, t: string) => {
    start(async () => {
      const d = await loadStatistic(f || undefined, t || undefined);
      setData(d);
      setTeacherId((v) => v || d.teachers[0]?.id || "");
      setClassId((v) => v || d.classes[0]?.id || "");
    });
  }, []);
  useEffect(() => { load(from, to); }, [load, from, to]);

  const period = (days: number) => {
    const end = new Date(); const startDt = new Date(); startDt.setDate(end.getDate() - days);
    setFrom(ymd(startDt)); setTo(ymd(end));
  };
  const pickYear = (y: string) => { if (!y) { setFrom(""); setTo(""); return; } setFrom(`${y}-01-01`); setTo(`${y}-12-31`); };

  const tSum = data.teacherSummary[teacherId];
  const cSum = data.classSummary[classId];
  const tRows = data.teacherRows[menu] ?? [];
  const cRows = data.classRows[menu] ?? [];

  const excel = (rows: StatRow[], head: string) => {
    const header = [head, "생성 개수", "채점 개수", "채점률(평균)", "성취도(평균)",
      ...[1, 2, 3].flatMap((n) => [`오답${n} 출제`, `오답${n} 채점`, `오답${n} 채점률`, `오답${n} 성취도(평균)`])];
    const body = rows.map((r) => [r.name, ...r.groups.flatMap((q) => [String(q.created), String(q.marked), pct(rate(q)), pct(q.achieve)])]);
    const total = ["합계", ...[0, 1, 2, 3].flatMap((g) => {
      const assigned = sum(rows, g, (q) => q.assigned), marked = sum(rows, g, (q) => q.marked);
      const ach = rows.filter((r) => r.groups[g].achieve != null);
      return [String(sum(rows, g, (q) => q.created)), String(marked), pct(assigned ? (marked / assigned) * 100 : 0),
        pct(ach.length ? ach.reduce((a, r) => a + (r.groups[g].achieve ?? 0), 0) / ach.length : 0)];
    })];
    const csv = [header, ...body, total].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = `학습현황_${head}_${menu}_${ymd(new Date())}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

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
      <ListTab tabs={MANAGEMENT_TABS} />
      <ul className="list-tab--3 mt-16 mb-24" role="tablist">
        {["선생님별 현황", "반별 현황"].map((t, i) => (
          <li key={t} className="nav-item" role="presentation">
            <button className={`nav-link${pane === i ? " active" : ""}`} data-bs-toggle="tab" data-bs-target={`#tab-pane-2-${i + 1}`}
              type="button" role="tab" aria-selected={pane === i} tabIndex={-1} onClick={() => setPane(i)}>{t}</button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {/* 선생님별 현황 */}
        <div className={`tab-pane fade${pane === 0 ? " active show" : ""}`} id="tab-pane-2-1" role="tabpanel" tabIndex={0}>
          <PeriodFilter from={from} to={to} setFrom={setFrom} setTo={setTo} period={period} pickYear={pickYear} />
          <div className="manegment">
            <h4 className="d-flex justify-between align-items-center"> 현황 요약
              <div className="select__small">
                <select className="fw-700 f-12" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  {data.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </h4>
            <div className="sum-board">
              <div className="sum-board-group">
                <div className="sum-board-item">
                  <div className="counting"><span className="label">담임으로 배정된 반 수</span><span className="data">{tSum?.classCount ?? 0}반</span></div>
                  <div className="icon"><i className="fa-sharp fa-light fa-screen-users" aria-hidden="true"></i></div>
                </div>
                <div className="sum-board-item">
                  <div className="counting"><span className="label">반에 배치된 학생 수</span><span className="data">{tSum?.studentCount ?? 0}명</span></div>
                  <div className="icon"><i className="fa-sharp fa-light fa-users" aria-hidden="true"></i></div>
                </div>
              </div>
              <Graph items={[["제작한 총 문제지", "pb-total", tSum?.total ?? 0], ["미채점 문제지", "pb-ing", tSum?.ungraded ?? 0], ["오답출제 해야 할 문제지", "pb-warning", tSum?.wrongTodo ?? 0]]} />
            </div>
            <h4>메뉴별 상세 현황</h4>
            <div className="menu-board">
              <MenuTabs menu={menu} setMenu={setMenu} onExcel={() => excel(tRows, "선생님")} />
              <div id="teacherstudyexcel" className="table-responsive no-shadow">
                <SumTable rows={tRows} firstCol="선생님" />
              </div>
            </div>
          </div>
        </div>

        {/* 반별 현황 */}
        <div className={`tab-pane fade${pane === 1 ? " active show" : ""}`} id="tab-pane-2-2" role="tabpanel" tabIndex={0}>
          <PeriodFilter from={from} to={to} setFrom={setFrom} setTo={setTo} period={period} pickYear={pickYear} />
          <div className="manegment">
            <h4 className="d-flex justify-between align-items-center"> 현황 요약
              <div className="select__small">
                <select className="fw-700 f-12" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </h4>
            <div className="sum-board">
              <div className="sum-board-group">
                <div className="sum-board-item">
                  <div className="counting"><span className="label">편성된 학생 수</span><span className="data">{cSum?.studentCount ?? 0}명</span></div>
                  <div className="icon"><i className="fa-sharp fa-light fa-users" aria-hidden="true"></i></div>
                </div>
                <div className="sum-board-item">
                  <div className="counting"><span className="label">등록된 교재수</span><span className="data">{cSum?.bookCount ? `${cSum.bookCount}개` : " - 개"}</span></div>
                  <div className="icon"><i className="fa-sharp fa-light fa-books" aria-hidden="true"></i></div>
                </div>
                <div className="sum-board-item">
                  <div className="counting"><span className="label">학습 성취도</span><span className="data">{cSum?.achieve != null ? `${Math.round(cSum.achieve)}%` : "-"}</span></div>
                  <div className="icon"><i className="fa-sharp fa-light fa-chart-user" aria-hidden="true"></i></div>
                </div>
              </div>
              <Graph items={[["미채점 문제지", "pb-ing", cSum?.ungraded ?? 0], ["오답출제 해야 할 문제지", "pb-warning", cSum?.wrongTodo ?? 0]]} />
            </div>
            <h4>메뉴별 상세 현황</h4>
            <div className="menu-board">
              <MenuTabs menu={menu} setMenu={setMenu} onExcel={() => excel(cRows, "반명")} />
              <div id="groupstudyexcel" className="table-responsive">
                <SumTable rows={cRows} firstCol="반명" />
              </div>
            </div>
            <h4>등록된 교재</h4>
            <table className="table table-bordered table-basic table-regibook">
              <thead><tr><th className="text-left">반명</th><th>교재명</th></tr></thead>
              <tbody>
                {data.classBooks.map((b, i) => <tr key={i}><td className="text-left">{b.className}</td><td>{b.bookName}</td></tr>)}
              </tbody>
            </table>
            <div className="pagination">
              <div className="pagination__wrap">
                <a href="javascript:void(0);" className="prev disabled"><i className="fa-light fa-angle-left" aria-hidden="true"></i></a>
                <a href="javascript:void(0);" className="active">1</a>
                <a href="javascript:void(0);" className="next" onClick={(e) => { e.preventDefault(); metaAlert("마지막 페이지입니다."); }}><i className="fa-light fa-angle-right" aria-hidden="true"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

function PeriodFilter({ from, to, setFrom, setTo, period, pickYear }: {
  from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void; period: (d: number) => void; pickYear: (y: string) => void;
}) {
  const year = from && to && from.slice(0, 4) === to.slice(0, 4) && from.endsWith("-01-01") && to.endsWith("-12-31") ? from.slice(0, 4) : "";
  return (
    <div className="listFilter-wrap">
      <ul><li>
        <label className="listFilter-title">검색 기간</label>
        <div className="listFilter-items">
          <div className="duration">
            <div className="position-relative">
              <input type="date" className="startDate" placeholder="시작일" value={from} onChange={(e) => setFrom(e.target.value)} />
              <i className="fa-sharp fa-regular fa-calendar" aria-hidden="true" style={{ zIndex: 1, cursor: "pointer" }}></i>
            </div>
            <span className="between">-</span>
            <div className="position-relative">
              <input type="date" className="endDate" placeholder="종료일" value={to} onChange={(e) => setTo(e.target.value)} />
              <i className="fa-sharp fa-regular fa-calendar" aria-hidden="true" style={{ zIndex: 1, cursor: "pointer" }}></i>
            </div>
            <div className="select__small" style={{ marginLeft: 8, display: "inline-block", verticalAlign: "middle" }}>
              <select className="year-select" style={{ width: "auto" }} value={year} onChange={(e) => pickYear(e.target.value)}>
                <option value="">연도선택</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="btn-group" role="group">
            {[[365, "1년"], [180, "6개월"], [90, "3개월"]].map(([d, l]) => (
              <button key={l} className="btn period-btn" data-range={d} onClick={() => period(Number(d))}>{l}</button>
            ))}
          </div>
        </div>
      </li></ul>
    </div>
  );
}

function MenuTabs({ menu, setMenu, onExcel }: { menu: string; setMenu: (m: string) => void; onExcel: () => void }) {
  return (
    <ul className="list-tab" role="tablist">
      {MENUS.map((m) => (
        <li key={m} className="nav-item" role="presentation">
          <button className={`nav-link${menu === m ? " active" : ""}`} type="button" role="tab" aria-selected={menu === m} onClick={() => setMenu(m)}>{m}</button>
        </li>
      ))}
      <li className="nav-item" style={{ marginLeft: "auto" }}>
        <button type="button" className="mt-8 button__fill button__line--xsmall button__line--white bw10" onClick={onExcel}>
          <i className="fa-sharp fa-regular fa-file-arrow-down" aria-hidden="true"></i> 엑셀 다운 </button>
      </li>
    </ul>
  );
}

function Graph({ items }: { items: [string, string, number][] }) {
  const max = Math.max(1, ...items.map(([, , v]) => v));
  return (
    <div className="sum-board-group">
      <div className="sum-board-graph">
        <div className="charts col-7">
          <div className="x-axis">{Array.from({ length: 10 }, (_, i) => <span key={i}></span>)}</div>
          <div className="progress-group">
            {items.map(([, cls, v], i) => (
              <div key={cls} className="progress" role="progressbar" aria-valuenow={(i + 1) * 25} aria-valuemin={0} aria-valuemax={100}>
                <div className={`progress-bar ${cls}`} style={{ width: `${Math.round((v / max) * 100)}%` }}>{v}장</div>
              </div>
            ))}
          </div>
        </div>
        <ul className="legend">
          {items.map(([label, cls, v]) => <li key={cls}><span className="label">{label}</span><span className={`data ${cls}`}>{v}장</span></li>)}
        </ul>
      </div>
    </div>
  );
}

function SumTable({ rows, firstCol }: { rows: StatRow[]; firstCol: string }) {
  const totals = useMemo(() => [0, 1, 2, 3].map((g) => {
    const assigned = sum(rows, g, (q) => q.assigned), marked = sum(rows, g, (q) => q.marked);
    const ach = rows.filter((r) => r.groups[g].achieve != null);
    return {
      created: sum(rows, g, (q) => q.created), marked,
      rate: assigned ? (marked / assigned) * 100 : 0,
      achieve: ach.length ? ach.reduce((a, r) => a + (r.groups[g].achieve ?? 0), 0) / ach.length : 0,
    };
  }), [rows]);
  return (
    <table className="table table-bordered table-menu-sum">
      <thead>
        <tr><th></th><th colSpan={4}>원시험지</th><th colSpan={4}>오답1 시험지</th><th colSpan={4}>오답2 시험지</th><th colSpan={4}>오답3 시험지</th></tr>
        <tr>
          <th>{firstCol}</th>
          <th>생성 개수</th><th>채점 개수</th><th>채점률(평균)</th><th>성취도(평균)</th>
          {[1, 2, 3].map((n) => <Fragment key={n}><th>출제</th><th>채점</th><th>채점률</th><th>성취도(평균)</th></Fragment>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.name}</td>
            {r.groups.map((q, i) => (
              <Fragment key={i}>
                <td>{q.created}</td><td>{q.marked}</td>
                <td>{q.assigned ? pct(rate(q)) : ""}</td><td>{q.achieve != null ? pct(q.achieve) : ""}</td>
              </Fragment>
            ))}
          </tr>
        ))}
        <tr>
          <td>합계</td>
          {totals.map((t, i) => (
            <Fragment key={i}><td>{t.created}</td><td>{t.marked}</td><td>{pct(t.rate)}</td><td>{pct(t.achieve)}</td></Fragment>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
