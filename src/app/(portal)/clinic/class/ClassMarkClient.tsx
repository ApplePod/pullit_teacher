"use client";
import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { classMarkSummary, type ClassMarkRow } from "../clinicActions";
export function ClassMarkClient() {
  const [rows, setRows] = useState<ClassMarkRow[]>([]);
  const [pending, start] = useTransition();
  useEffect(() => { start(async () => setRows(await classMarkSummary())); }, []);
  return (
    <div className="contens-body">
      <ListTab tabs={CLINIC_TABS} className="mb-24" />
      <div className="alert alert-blue fade show p-3 mb-16" role="alert">
        <div className="d-flex gap-1"><span className="material-symbols-sharp">error</span>
          <div className="msg">반에 배정된 문제지의 채점 현황입니다. 문제지 배정 시 반을 지정하면 여기에 반별로 집계됩니다.</div></div>
      </div>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead><tr><th className="text-left">반 명</th><th>배정 문항 건수</th><th>채점 완료</th><th>반 평균</th><th>성취도</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.class_id}>
                <td className="text-left"><b>{r.class_name}</b></td>
                <td>{r.total}</td><td>{r.marked}</td>
                <td>{r.avg_score != null ? `${r.avg_score}점` : "-"}</td>
                <td>{r.avg_score != null ? <div className="report-bar"><span style={{ width: `${r.avg_score}%` }} /></div> : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "등록된 반이 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
