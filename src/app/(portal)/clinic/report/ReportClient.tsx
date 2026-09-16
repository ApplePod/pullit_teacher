"use client";

import { useEffect, useState, useTransition } from "react";
import { ListTab } from "@/components/portal/ListTab";
import { CLINIC_TABS } from "@/lib/nav";
import { studentReport, type ReportRow } from "../clinicActions";
import { GRADE_LABEL } from "@/lib/mgmt-consts";

export function ReportClient() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [pending, start] = useTransition();
  useEffect(() => { start(async () => setRows(await studentReport())); }, []);
  return (
    <div className="contens-body">
      <ListTab tabs={CLINIC_TABS} className="mb-24" />
      <h3 className="section-title">학습 분석 보고서</h3>
      <p className="sample-guide">채점 완료된 문제지 기준 학생별 평균 점수·진행 현황입니다.</p>
      <div className="table-basic">
        <table className="table-layout-basic">
          <thead><tr><th className="text-left">학생명</th><th>학년</th><th>배정</th><th>채점 완료</th><th>평균 점수</th><th>성취도</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student_id}>
                <td className="text-left"><b>{r.student_name}</b></td>
                <td>{GRADE_LABEL[r.grade] ?? r.grade}</td>
                <td>{r.assigned}</td><td>{r.marked}</td>
                <td>{r.avg_score != null ? `${r.avg_score}점` : "-"}</td>
                <td>{r.avg_score != null ? <div className="report-bar"><span style={{ width: `${r.avg_score}%` }} /></div> : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="text-center" style={{ padding: "32px 0", color: "#97979d" }}>{pending ? "불러오는 중…" : "학생 데이터가 없습니다."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
