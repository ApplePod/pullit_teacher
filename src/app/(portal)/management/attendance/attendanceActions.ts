"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AttStudent {
  id: string; name: string; grade: string; class_id: string | null; class_name: string;
  in_sms_send_yn: "Y" | "N"; ot_sms_send_yn: "Y" | "N";
}
export interface AttRecord { student_id: string; attended_on: string; status: string }
export interface AttSaveRow { student_id: string; data: string }   // 원본 f_data: "A#L#-#..." (1일~말일)

/** 원본 출결 코드 A(출석)/L(지각)/E(조퇴)/X(결석)/-(미처리) ↔ DB attendance_status */
const TO_DB: Record<string, string> = { A: "present", L: "late", E: "early", X: "absent" };
const TO_ATD: Record<string, string> = { present: "A", late: "L", early: "E", absent: "X", excused: "E" };

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id } : null;
}

function range(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { first: `${ym}-01`, last: `${ym}-${String(last).padStart(2, "0")}`, days: last };
}

export async function listClassOptions(grade?: string): Promise<{ id: string; name: string }[]> {
  const c = await ctx(); if (!c) return [];
  let q = c.supabase.from("class_group").select("id,name,grade").eq("is_active", true).order("name");
  if (grade) q = q.eq("grade", grade);
  const { data } = await q;
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.name as string }));
}

export async function loadMonth(ym: string, opts?: { key?: string; keyword?: string; grade?: string; classId?: string }): Promise<{ students: AttStudent[]; records: AttRecord[] }> {
  const c = await ctx(); if (!c) return { students: [], records: [] };
  const { first, last } = range(ym);
  const { data: rawStudents } = await c.supabase.from("student")
    .select("id,name,grade,class_student(class_id,class_group(name))").neq("state", "left").order("name");
  let students: AttStudent[] = (rawStudents ?? []).map((r) => {
    const cs = (r as unknown as { class_student?: { class_id: string; class_group?: { name?: string } | null }[] }).class_student ?? [];
    return {
      id: r.id as string, name: r.name as string, grade: r.grade as string,
      class_id: cs[0]?.class_id ?? null, class_name: cs.map((x) => x.class_group?.name ?? "").filter(Boolean).join(", "),
      in_sms_send_yn: "N", ot_sms_send_yn: "N",
    };
  });
  if (opts?.grade) students = students.filter((s) => s.grade === opts.grade);
  if (opts?.classId) students = students.filter((s) => s.class_id === opts.classId);
  const kw = (opts?.keyword ?? "").trim();
  if (kw) {
    students = students.filter((s) => {
      if (opts?.key === "user_nm") return s.name.includes(kw);
      if (opts?.key === "group_nm") return s.class_name.includes(kw);
      return s.name.includes(kw) || s.class_name.includes(kw);
    });
  }
  const { data: records } = await c.supabase.from("attendance")
    .select("student_id,attended_on,status").gte("attended_on", first).lte("attended_on", last);
  return {
    students,
    records: (records ?? []).map((r) => ({
      student_id: r.student_id as string, attended_on: r.attended_on as string,
      status: TO_ATD[r.status as string] ?? "-",
    })),
  };
}

/** 학생별 소속 반 (attendance.class_id 를 채워 unique(student_id,class_id,attended_on) 가 동작하도록) */
async function classOf(supabase: Awaited<ReturnType<typeof createClient>>, studentIds: string[]) {
  const map = new Map<string, string | null>();
  if (studentIds.length === 0) return map;
  const { data } = await supabase.from("class_student").select("class_id,student_id").in("student_id", studentIds);
  (data ?? []).forEach((r) => { if (!map.has(r.student_id as string)) map.set(r.student_id as string, r.class_id as string); });
  studentIds.forEach((id) => { if (!map.has(id)) map.set(id, null); });
  return map;
}

/** 셀 하나만 즉시 저장 (원본에는 없지만 기존 호출 호환용) */
export async function setAttendance(student_id: string, attended_on: string, status: string | null): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  await c.supabase.from("attendance").delete().eq("student_id", student_id).eq("attended_on", attended_on);
  if (status && status !== "-") {
    const cls = (await classOf(c.supabase, [student_id])).get(student_id) ?? null;
    await c.supabase.from("attendance").insert({
      center_id: c.center_id, student_id, class_id: cls, attended_on, status: TO_DB[status] ?? status, created_by: c.user.id,
    });
  }
  revalidatePath("/management/attendance");
  return {};
}

/** 원본 doSubmit — 해당 월 전체를 통째로 저장 */
export async function saveMonth(ym: string, rows: AttSaveRow[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const { first, last } = range(ym);
  const ids = rows.map((r) => r.student_id);
  if (ids.length === 0) return {};
  const { error: de } = await c.supabase.from("attendance")
    .delete().in("student_id", ids).gte("attended_on", first).lte("attended_on", last);
  if (de) return { error: "저장에 실패했습니다." };
  const clsMap = await classOf(c.supabase, ids);
  const inserts: { center_id: string; student_id: string; class_id: string | null; attended_on: string; status: string; created_by: string }[] = [];
  for (const row of rows) {
    row.data.split("#").forEach((v, i) => {
      const db = TO_DB[v];
      if (!db) return;
      inserts.push({
        center_id: c.center_id, student_id: row.student_id, class_id: clsMap.get(row.student_id) ?? null,
        attended_on: `${ym}-${String(i + 1).padStart(2, "0")}`, status: db, created_by: c.user.id,
      });
    });
  }
  if (inserts.length) {
    const { error } = await c.supabase.from("attendance").insert(inserts);
    if (error) return { error: "저장에 실패했습니다." };
  }
  revalidatePath("/management/attendance");
  return {};
}
