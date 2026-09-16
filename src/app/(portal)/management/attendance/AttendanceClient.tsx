"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { MANAGEMENT_TABS } from "@/lib/nav";
import { loadMonth, setAttendance, type AttStudent, type AttRecord } from "./attendanceActions";

const CYCLE = ["present", "late", "early", "absent"] as const;
const ABBR: Record<string, string> = { present: "출", late: "지", early: "조", absent: "결" };
const LEGEND: [string, string][] = [["present", "출석"], ["late", "지각"], ["early", "조퇴"], ["absent", "결석"]];

function thisMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

export function AttendanceClient() {
  const [ym, setYm] = useState(thisMonth());
  const [students, setStudents] = useState<AttStudent[]>([]);
  const [map, setMap] = useState<Map<string, string>>(new Map());
  const [pending, start] = useTransition();

  const days = useMemo(() => {
    const [y, m] = ym.split("-").map(Number);
    return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => i + 1);
  }, [ym]);

  const load = (m: string) => start(async () => {
    const { students, records } = await loadMonth(m);
    setStudents(students);
    setMap(new Map(records.map((r: AttRecord) => [`${r.student_id}|${r.attended_on}`, r.status])));
  });
  useEffect(() => { load(ym); }, [ym]);

  const cellKey = (sid: string, day: number) => `${sid}|${ym}-${String(day).padStart(2, "0")}`;
  const cycle = (sid: string, day: number) => {
    const key = cellKey(sid, day); const cur = map.get(key);
    const idx = cur ? CYCLE.indexOf(cur as typeof CYCLE[number]) : -1;
    const next = idx + 1 >= CYCLE.length ? null : CYCLE[idx + 1];
    const nm = new Map(map); if (next) nm.set(key, next); else nm.delete(key); setMap(nm);
    const on = `${ym}-${String(day).padStart(2, "0")}`;
    start(async () => { await setAttendance(sid, on, next); });
  };

  return (
    <div className="contens-body">
      <ListTab tabs={MANAGEMENT_TABS} className="mb-24" />
      <div className="listFilter-wrap">
        <ul><li>
          <label className="listFilter-title">조회 월</label>
          <div className="listFilter-items d-flex gap-2 items-center">
            <input type="month" className="form-control" style={{ width: 180 }} value={ym} onChange={(e) => setYm(e.target.value)} />
            <div className="att-legend">{LEGEND.map(([k, l]) => <span key={k} className={`att-badge att-${k}`}>{ABBR[k]} {l}</span>)}</div>
          </div>
        </li></ul>
      </div>
      <p className="sample-guide mt-12">셀을 클릭하면 출석→지각→조퇴→결석→미처리 순으로 바뀝니다. {pending && "· 저장 중…"}</p>
      <div className="att-scroll">
        <table className="att-table">
          <thead>
            <tr><th className="att-name">학생명</th>{days.map((d) => <th key={d} className="att-day">{d}</th>)}</tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <th className="att-name text-left">{s.name}</th>
                {days.map((d) => {
                  const st = map.get(cellKey(s.id, d));
                  return <td key={d} className={`att-cell${st ? " att-" + st : ""}`} onClick={() => cycle(s.id, d)}>{st ? ABBR[st] : ""}</td>;
                })}
              </tr>
            ))}
            {students.length === 0 && <tr><td className="text-center" colSpan={days.length + 1} style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 학생이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
