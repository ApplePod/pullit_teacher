"use server";

import { createClient } from "@/lib/supabase/server";

import { getAuthedUser } from "@/lib/supabase/claims";
/** 원본 학습현황(statistic.cshtml) 표 구조에 맞춘 집계 */
export interface StatQuad { created: number; assigned: number; marked: number; achieve: number | null }
export interface StatRow { id: string; name: string; groups: StatQuad[] } // [원시험지, 오답1, 오답2, 오답3]
export interface TeacherSummary { classCount: number; studentCount: number; total: number; ungraded: number; wrongTodo: number }
export interface ClassSummary { studentCount: number; bookCount: number; achieve: number | null; ungraded: number; wrongTodo: number }
export interface StatData {
  teachers: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  teacherSummary: Record<string, TeacherSummary>;
  classSummary: Record<string, ClassSummary>;
  teacherRows: Record<string, StatRow[]>;
  classRows: Record<string, StatRow[]>;
  classBooks: { className: string; bookName: string }[];
}

// 메뉴 탭 ↔ 우리 paper_type (원본 메뉴 중 우리 데이터에 대응이 없는 것은 빈 집계)
const MENU_OF_TYPE: Record<string, string> = {
  custom: "교과학습",
  level_test: "진단평가",
  achievement_test: "성취도 평가",
  calculation: "유형집중학습",
};
const ALL = "총 합계";

type Acc = { created: number; assigned: number; marked: number; scoreSum: number; scoreCnt: number };
const emptyAcc = (): Acc => ({ created: 0, assigned: 0, marked: 0, scoreSum: 0, scoreCnt: 0 });
const quad = (a: Acc | undefined): StatQuad =>
  a ? { created: a.created, assigned: a.assigned, marked: a.marked, achieve: a.scoreCnt ? a.scoreSum / a.scoreCnt : null }
    : { created: 0, assigned: 0, marked: 0, achieve: null };

export async function loadStatistic(from?: string, to?: string): Promise<StatData> {
  const empty: StatData = { teachers: [], classes: [], teacherSummary: {}, classSummary: {}, teacherRows: {}, classRows: {}, classBooks: [] };
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  if (!user) return empty;
  const { data: me } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  if (!me) return empty;

  const [profRes, classRes, csRes, ctRes, bookRes, paperRes, wsRes, asgRes, asRes, wiRes] = await Promise.all([
    supabase.from("profile").select("id,name").order("name"),
    supabase.from("class_group").select("id,name,teacher_id").order("name"),
    supabase.from("class_student").select("class_id,student_id"),
    supabase.from("class_textbook").select("class_id,textbook_id"),
    supabase.from("textbook").select("id,name"),
    supabase.from("paper").select("id,created_by,paper_type,problem_count,created_at").is("deleted_at", null),
    supabase.from("wrong_answer_set").select("paper_id"),
    supabase.from("assignment").select("id,paper_id,class_id,assigned_at"),
    supabase.from("assignment_student").select("id,assignment_id,student_id,status,score,correct_count"),
    supabase.from("wrong_answer_item").select("source_assignment_student_id"),
  ]);

  const teachers = (profRes.data ?? []).map((p) => ({ id: p.id as string, name: p.name as string }));
  const classes = (classRes.data ?? []).map((c) => ({ id: c.id as string, name: c.name as string, teacher_id: c.teacher_id as string | null }));
  const bookName = new Map((bookRes.data ?? []).map((b) => [b.id as string, b.name as string]));
  const papers = new Map((paperRes.data ?? []).map((p) => [p.id as string, p as { id: string; created_by: string | null; paper_type: string; problem_count: number; created_at: string }]));
  const wrongPapers = new Set((wsRes.data ?? []).map((w) => w.paper_id as string).filter(Boolean));
  const wrongSourced = new Set((wiRes.data ?? []).map((w) => w.source_assignment_student_id as string).filter(Boolean));
  const asgById = new Map((asgRes.data ?? []).map((a) => [a.id as string, a as { id: string; paper_id: string; class_id: string | null; assigned_at: string }]));

  const inRange = (iso: string | null) => {
    if (!iso) return false;
    const d = iso.slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };
  const menuOf = (paperType: string, paperId: string) => (wrongPapers.has(paperId) ? "오답집중학습" : MENU_OF_TYPE[paperType] ?? "교과학습");
  const groupOf = (paperId: string) => (wrongPapers.has(paperId) ? 1 : 0);

  const tAcc = new Map<string, Acc>(); // `${teacherId}|${menu}|${group}`
  const cAcc = new Map<string, Acc>();
  const bump = (m: Map<string, Acc>, id: string, menu: string, g: number, fn: (a: Acc) => void) => {
    for (const key of [`${id}|${menu}|${g}`, `${id}|${ALL}|${g}`]) {
      const a = m.get(key) ?? emptyAcc(); fn(a); m.set(key, a);
    }
  };

  // 생성 개수 — 선생님: 본인이 만든 문제지 / 반: 반에 배정된 문제지
  for (const p of papers.values()) {
    if (!inRange(p.created_at) || !p.created_by) continue;
    bump(tAcc, p.created_by, menuOf(p.paper_type, p.id), groupOf(p.id), (a) => { a.created += 1; });
  }
  // 반 귀속: assignment.class_id 가 있으면 그 반, 없으면(학생 개별 배정) 학생이 속한 반들
  const classesOfStudent = new Map<string, string[]>();
  for (const r of csRes.data ?? []) {
    const sid = r.student_id as string;
    classesOfStudent.set(sid, [...(classesOfStudent.get(sid) ?? []), r.class_id as string]);
  }
  const countedClassPaper = new Set<string>();

  const tSum: Record<string, TeacherSummary> = {};
  const cSum: Record<string, ClassSummary> = {};
  const tExtra = new Map<string, { ungraded: number; wrongTodo: number }>();
  const cExtra = new Map<string, { ungraded: number; wrongTodo: number; scoreSum: number; scoreCnt: number }>();

  for (const st of asRes.data ?? []) {
    const a = asgById.get(st.assignment_id as string); if (!a || !inRange(a.assigned_at)) continue;
    const p = papers.get(a.paper_id); if (!p) continue;
    const menu = menuOf(p.paper_type, p.id), g = groupOf(p.id);
    const marked = st.status === "marked";
    const score = st.score == null ? null : Number(st.score);
    const wrongTodo = marked && (st.correct_count ?? 0) < (p.problem_count ?? 0) && !wrongSourced.has(st.id as string);
    if (p.created_by) {
      bump(tAcc, p.created_by, menu, g, (x) => { x.assigned += 1; if (marked) { x.marked += 1; if (score != null) { x.scoreSum += score; x.scoreCnt += 1; } } });
      const e = tExtra.get(p.created_by) ?? { ungraded: 0, wrongTodo: 0 };
      if (!marked) e.ungraded += 1; if (wrongTodo) e.wrongTodo += 1;
      tExtra.set(p.created_by, e);
    }
    const targetClasses = a.class_id ? [a.class_id] : classesOfStudent.get(st.student_id as string) ?? [];
    for (const cid of targetClasses) {
      if (!countedClassPaper.has(`${cid}|${p.id}`)) {
        countedClassPaper.add(`${cid}|${p.id}`);
        bump(cAcc, cid, menu, g, (x) => { x.created += 1; });
      }
      bump(cAcc, cid, menu, g, (x) => { x.assigned += 1; if (marked) { x.marked += 1; if (score != null) { x.scoreSum += score; x.scoreCnt += 1; } } });
      const e = cExtra.get(cid) ?? { ungraded: 0, wrongTodo: 0, scoreSum: 0, scoreCnt: 0 };
      if (!marked) e.ungraded += 1; if (wrongTodo) e.wrongTodo += 1;
      if (marked && score != null) { e.scoreSum += score; e.scoreCnt += 1; }
      cExtra.set(cid, e);
    }
  }

  for (const t of teachers) {
    const myClasses = classes.filter((c) => c.teacher_id === t.id).map((c) => c.id);
    const students = new Set((csRes.data ?? []).filter((r) => myClasses.includes(r.class_id as string)).map((r) => r.student_id as string));
    const e = tExtra.get(t.id) ?? { ungraded: 0, wrongTodo: 0 };
    tSum[t.id] = {
      classCount: myClasses.length, studentCount: students.size,
      total: [...papers.values()].filter((p) => p.created_by === t.id && inRange(p.created_at)).length,
      ungraded: e.ungraded, wrongTodo: e.wrongTodo,
    };
  }
  for (const c of classes) {
    const e = cExtra.get(c.id) ?? { ungraded: 0, wrongTodo: 0, scoreSum: 0, scoreCnt: 0 };
    cSum[c.id] = {
      studentCount: (csRes.data ?? []).filter((r) => r.class_id === c.id).length,
      bookCount: (ctRes.data ?? []).filter((r) => r.class_id === c.id).length,
      achieve: e.scoreCnt ? e.scoreSum / e.scoreCnt : null,
      ungraded: e.ungraded, wrongTodo: e.wrongTodo,
    };
  }

  const menus = ["교과학습", "교재매칭", "일일평가", "진단평가", "성취도 평가", "수능·모의고사 기출", "오답집중학습", "유형집중학습", ALL];
  const rowsFor = (m: Map<string, Acc>, list: { id: string; name: string }[], menu: string): StatRow[] =>
    list.map((e) => ({ id: e.id, name: e.name, groups: [0, 1, 2, 3].map((g) => quad(m.get(`${e.id}|${menu}|${g}`))) }))
      .filter((r) => r.groups.some((g) => g.created || g.assigned || g.marked));

  const teacherRows: Record<string, StatRow[]> = {};
  const classRows: Record<string, StatRow[]> = {};
  for (const menu of menus) {
    teacherRows[menu] = rowsFor(tAcc, teachers, menu);
    classRows[menu] = rowsFor(cAcc, classes, menu);
  }

  const classBooks = (ctRes.data ?? []).map((r) => ({
    className: classes.find((c) => c.id === r.class_id)?.name ?? "-",
    bookName: bookName.get(r.textbook_id as string) ?? "-",
  }));

  return {
    teachers, classes: classes.map((c) => ({ id: c.id, name: c.name })),
    teacherSummary: tSum, classSummary: cSum, teacherRows, classRows, classBooks,
  };
}
