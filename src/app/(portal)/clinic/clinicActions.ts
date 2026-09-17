"use server";

import { revalidatePath } from "next/cache";
import { fmtISO } from "@/lib/date";
import { getAuthedUser } from "@/lib/supabase/claims";
import { createClient } from "@/lib/supabase/server";

export interface AssignmentRow {
  as_id: string; student_id: string; student_name: string; paper_id: string; paper_name: string;
  subject: string; problem_count: number; status: string; correct_count: number | null; score: number | null;
  assigned_at: string; marked_at: string | null;
}

/** 학생별 채점 목록 한 줄 (assignment_student 1건) */
export interface StudentAsgRow extends AssignmentRow {
  assignment_id: string; student_grade: string; class_id: string | null; class_name: string | null;
  due_at: string | null; maker: string | null; paper_type: string; tags: string[];
  wrong_count: number; enote_done: boolean;
}

/** 반별 채점 목록 한 줄 (class_id 가 있는 assignment 1건) */
export interface ClassAsgRow {
  assignment_id: string; paper_id: string; paper_name: string; subject: string; problem_count: number;
  class_id: string; class_name: string; total: number; marked: number;
  assigned_at: string; due_at: string | null; marked_at: string | null; maker: string | null;
  paper_type: string; tags: string[]; wrong_count: number; enote_done: boolean;
  students: { as_id: string; student_id: string; student_name: string; status: string; correct_count: number | null; score: number | null }[];
}

/** 휴지통 한 줄 (학생 배정 또는 반 배정) */
export interface TrashRow {
  key: string; kind: "student" | "class"; as_id: string; assignment_id: string;
  paper_id: string; paper_name: string; target_name: string; problem_count: number;
  assigned_at: string; due_at: string | null; marked_at: string | null; trashed_at: string;
  maker: string | null; subject: string; paper_type: string;
}

export interface ClinicFilter {
  dateField?: string; start?: string; end?: string;
  searchField?: string; keyword?: string;
  band?: string; markYn?: string; enoteYn?: string; tag?: string;
}

async function ctx() {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id as string } : null;
}

/* 휴지통 — assignment.deleted_at(반 배정 단위) / assignment_student.deleted_at(학생 단위) */
const dOnly = (v: string | null | undefined) => (v ? v.slice(0, 10) : "");

interface RawAsg {
  id: string; paper_id: string; class_id: string | null; assigned_at: string; due_at: string | null; deleted_at: string | null;
  paper?: { id: string; name: string; subject: string; problem_count: number; paper_type: string; tags: string[] | null; created_by: string | null } | null;
  class?: { id: string; name: string } | null;
}
interface RawAst {
  id: string; assignment_id: string; student_id: string; status: string; correct_count: number | null; score: number | null; marked_at: string | null; deleted_at: string | null;
  student?: { id: string; name: string; grade: string } | null;
}

async function loadAll() {
  const c = await ctx(); if (!c) return null;
  const [{ data: asg }, { data: ast }, { data: mk }, { data: wai }, { data: prof }] = await Promise.all([
    c.supabase.from("assignment").select("id,paper_id,class_id,assigned_at,due_at,deleted_at,paper:paper_id(id,name,subject,problem_count,paper_type,tags,created_by),class:class_id(id,name)").order("assigned_at", { ascending: false }),
    c.supabase.from("assignment_student").select("id,assignment_id,student_id,status,correct_count,score,marked_at,deleted_at,student:student_id(id,name,grade)"),
    c.supabase.from("marking").select("assignment_student_id,is_correct"),
    c.supabase.from("wrong_answer_item").select("source_assignment_student_id"),
    c.supabase.from("profile").select("id,name"),
  ]);
  const assignments = (asg ?? []) as unknown as RawAsg[];
  const students = (ast ?? []) as unknown as RawAst[];
  const wrong = new Map<string, number>();
  (mk ?? []).forEach((m) => { if (m.is_correct === false) wrong.set(m.assignment_student_id as string, (wrong.get(m.assignment_student_id as string) ?? 0) + 1); });
  const enote = new Set<string>((wai ?? []).map((w) => w.source_assignment_student_id as string).filter(Boolean));
  const makers = new Map((prof ?? []).map((p) => [p.id as string, p.name as string]));
  const byAsg = new Map<string, RawAst[]>();
  students.forEach((s) => { const l = byAsg.get(s.assignment_id) ?? []; l.push(s); byAsg.set(s.assignment_id, l); });
  return { c, assignments, students, byAsg, wrong, enote, makers };
}

const BAND: Record<string, string> = { GRE: "e", GRM: "m", GRH: "h" };

function passCommon(f: ClinicFilter, o: { paper_name: string; student_name: string; maker: string | null; paper_id: string; tags: string[]; date: string }) {
  if (f.start && (!o.date || o.date < f.start)) return false;
  if (f.end && (!o.date || o.date > f.end)) return false;
  const kw = (f.keyword ?? "").trim();
  if (kw) {
    const field = f.searchField || "paper_nm";
    const hay = field === "student_nm" ? o.student_name
      : field === "maker_nm" ? (o.maker ?? "")
      : field === "paper_id" ? o.paper_id
      : field === "tag" ? o.tags.join(" ")
      : `${o.paper_name} ${o.student_name} ${o.maker ?? ""}`;
    if (!hay.toLowerCase().includes(kw.toLowerCase())) return false;
  }
  if (f.tag && !o.tags.includes(f.tag)) return false;
  return true;
}

/** 학생별 채점 목록 */
export async function listStudentAssignments(f: ClinicFilter = {}): Promise<StudentAsgRow[]> {
  const all = await loadAll(); if (!all) return [];
  const out: StudentAsgRow[] = [];
  all.assignments.forEach((a) => {
    if (a.class_id) return;                       // 반별 배정은 '반별 채점' 화면
    if (a.deleted_at) return;                     // 휴지통
    (all.byAsg.get(a.id) ?? []).forEach((s) => {
      if (s.deleted_at) return;                   // 휴지통
      const wrong_count = all.wrong.get(s.id) ?? 0;
      const enote_done = all.enote.has(s.id);
      const row: StudentAsgRow = {
        as_id: s.id, assignment_id: a.id, student_id: s.student?.id ?? "", student_name: s.student?.name ?? "",
        student_grade: s.student?.grade ?? "", class_id: null, class_name: null,
        paper_id: a.paper?.id ?? a.paper_id, paper_name: a.paper?.name ?? "", subject: a.paper?.subject ?? "",
        problem_count: a.paper?.problem_count ?? 0, paper_type: a.paper?.paper_type ?? "custom", tags: a.paper?.tags ?? [],
        status: s.status, correct_count: s.correct_count, score: s.score == null ? null : Number(s.score),
        assigned_at: a.assigned_at, due_at: a.due_at, marked_at: s.marked_at,
        maker: a.paper?.created_by ? all.makers.get(a.paper.created_by) ?? null : null,
        wrong_count, enote_done,
      };
      const date = dOnly(f.dateField === "mark_dt" ? row.marked_at : row.assigned_at);
      if (!passCommon(f, { ...row, date })) return;
      if (f.band && !(row.student_grade || "").startsWith(BAND[f.band] ?? "")) return;
      if (f.markYn === "Y" && row.status !== "marked") return;
      if (f.markYn === "N" && row.status === "marked") return;
      if (f.enoteYn === "E" && !enote_done) return;
      if (f.enoteYn === "N" && wrong_count > 0) return;
      if (f.enoteYn === "Y" && !(wrong_count > 0 && !enote_done)) return;
      out.push(row);
    });
  });
  return out;
}

/** 반별 채점 목록 */
export async function listClassAssignments(f: ClinicFilter = {}): Promise<ClassAsgRow[]> {
  const all = await loadAll(); if (!all) return [];
  const out: ClassAsgRow[] = [];
  all.assignments.forEach((a) => {
    if (!a.class_id) return;
    if (a.deleted_at) return;                     // 휴지통
    const kids = (all.byAsg.get(a.id) ?? []).filter((s) => !s.deleted_at);
    const wrong_count = kids.reduce((n, s) => n + (all.wrong.get(s.id) ?? 0), 0);
    const enote_done = kids.length > 0 && kids.every((s) => all.enote.has(s.id));
    const marked = kids.filter((s) => s.status === "marked").length;
    const lastMark = kids.map((s) => s.marked_at).filter(Boolean).sort().pop() ?? null;
    const row: ClassAsgRow = {
      assignment_id: a.id, paper_id: a.paper?.id ?? a.paper_id, paper_name: a.paper?.name ?? "",
      subject: a.paper?.subject ?? "", problem_count: a.paper?.problem_count ?? 0,
      paper_type: a.paper?.paper_type ?? "custom", tags: a.paper?.tags ?? [],
      class_id: a.class_id, class_name: a.class?.name ?? "", total: kids.length, marked,
      assigned_at: a.assigned_at, due_at: a.due_at, marked_at: lastMark,
      maker: a.paper?.created_by ? all.makers.get(a.paper.created_by) ?? null : null,
      wrong_count, enote_done,
      students: kids.map((s) => ({ as_id: s.id, student_id: s.student?.id ?? "", student_name: s.student?.name ?? "", status: s.status, correct_count: s.correct_count, score: s.score == null ? null : Number(s.score) })),
    };
    const date = dOnly(f.dateField === "mark_dt" ? row.marked_at : row.assigned_at);
    if (!passCommon(f, { paper_name: row.paper_name, student_name: row.class_name, maker: row.maker, paper_id: row.paper_id, tags: row.tags, date })) return;
    if (f.band && !kids.some((s) => (s.student?.grade ?? "").startsWith(BAND[f.band as string] ?? ""))) return;
    if (f.markYn === "Y" && !(row.total > 0 && row.marked === row.total)) return;
    if (f.markYn === "N" && row.total > 0 && row.marked === row.total) return;
    if (f.enoteYn === "E" && !enote_done) return;
    if (f.enoteYn === "N" && wrong_count > 0) return;
    if (f.enoteYn === "Y" && !(wrong_count > 0 && !enote_done)) return;
    out.push(row);
  });
  return out;
}

/** 휴지통 목록 */
export async function listClinicTrash(f: ClinicFilter = {}): Promise<TrashRow[]> {
  const all = await loadAll(); if (!all) return [];
  const out: TrashRow[] = [];
  all.assignments.forEach((a) => {
    const base = {
      assignment_id: a.id, paper_id: a.paper?.id ?? a.paper_id, paper_name: a.paper?.name ?? "",
      problem_count: a.paper?.problem_count ?? 0, subject: a.paper?.subject ?? "", paper_type: a.paper?.paper_type ?? "custom",
      assigned_at: a.assigned_at, due_at: a.due_at,
      maker: a.paper?.created_by ? all.makers.get(a.paper.created_by) ?? null : null,
    };
    const kids = all.byAsg.get(a.id) ?? [];
    if (a.deleted_at) {                            // 배정 단위 삭제 (반별 채점 행)
      out.push({ ...base, key: `c:${a.id}`, kind: "class", as_id: "",
        target_name: a.class?.name ?? kids.map((s) => s.student?.name ?? "").filter(Boolean).join(", "),
        marked_at: kids.map((s) => s.marked_at).filter(Boolean).sort().pop() ?? null, trashed_at: a.deleted_at });
      return;
    }
    kids.forEach((s) => {                          // 학생 단위 삭제 (학생별 채점 행)
      if (!s.deleted_at) return;
      out.push({ ...base, key: `s:${s.id}`, kind: "student", as_id: s.id,
        target_name: s.student?.name ?? "", marked_at: s.marked_at, trashed_at: s.deleted_at });
    });
  });
  return out.filter((r) => {
    const date = dOnly(f.dateField === "mark_dt" ? r.marked_at : r.assigned_at);
    return passCommon(f, { paper_name: r.paper_name, student_name: r.target_name, maker: r.maker, paper_id: r.paper_id, tags: [], date });
  }).sort((a, b) => (a.trashed_at < b.trashed_at ? 1 : -1));
}

/** 삭제(휴지통 이동) / 복원 — deleted_at 갱신 */
export async function trashAssignments(target: { asIds?: string[]; assignmentIds?: string[] }, restore = false): Promise<{ error?: string; count: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다.", count: 0 };
  const asIds = target.asIds ?? []; const agIds = target.assignmentIds ?? [];
  if (!asIds.length && !agIds.length) return { count: 0 };
  const deleted_at = restore ? null : new Date().toISOString();
  if (asIds.length) {
    const { error } = await c.supabase.from("assignment_student").update({ deleted_at }).in("id", asIds);
    if (error) return { error: "처리에 실패했습니다.", count: 0 };
  }
  if (agIds.length) {
    const { error } = await c.supabase.from("assignment").update({ deleted_at }).in("id", agIds);
    if (error) return { error: "처리에 실패했습니다.", count: asIds.length };
  }
  const count = asIds.length + agIds.length;
  revalidatePath("/clinic/studentmark"); revalidatePath("/clinic/class"); revalidatePath("/clinic/trash");
  return { count };
}

/** 채점 취소 — 채점 결과 삭제 후 미채점 상태로 되돌림 */
export async function cancelMarking(asIds: string[]): Promise<{ error?: string; count: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다.", count: 0 };
  if (!asIds.length) return { count: 0 };
  await c.supabase.from("marking").delete().in("assignment_student_id", asIds);
  const { error } = await c.supabase.from("assignment_student")
    .update({ status: "assigned", correct_count: null, score: null, marked_at: null, marked_by: null }).in("id", asIds);
  if (error) return { error: "채점 취소에 실패했습니다.", count: 0 };
  revalidatePath("/clinic/studentmark"); revalidatePath("/clinic/class");
  return { count: asIds.length };
}

/* ------------------------------------------------------------------ *
 * 개념(concept) 기반 대체 문항 고르기 — 오답 재출제 · 마법사 공용
 *
 * 폴백 체인 (앞에서부터 하나라도 후보가 있으면 거기서 뽑는다)
 *   1) 같은 개념(concept_id) + 같은 난이도 + 같은 문항유형(객관식/단답형)
 *   2) 같은 개념 + 같은 난이도
 *   3) 같은 개념 (난이도 무관)
 *   4) 같은 단원(unit_code) + 같은 난이도
 *   5) 같은 단원 (난이도 무관)
 *   6) 그래도 없으면 원본 문항 — 빈 문제지는 절대 만들지 않는다
 * 제외 대상: 학생이 이번에 틀린 문항들 + 이미 배정받은 적 있는 모든 문항 + 이번 문제지에 이미 담은 문항
 * ------------------------------------------------------------------ */
type Sb = Awaited<ReturnType<typeof createClient>>;

/** 대체 문항 후보 1건 (문제은행에서 고를 때 필요한 최소 정보) */
interface BankItem { problem_code: string; unit_code: string; concept_id: string | null; difficulty: string | null; answer_type: string | null }

/** 문항 코드 기준 고정 시드 — 같은 오답이면 항상 같은 대체 문항이 나오도록(재현 가능) */
function seedOf(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i += 1) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return h;
}

/** 후보 목록에서 제외 대상을 걸러내고 시드로 한 건 고른다 */
function pickFrom(cands: BankItem[], used: Set<string>, exclude: Set<string>, seed: number): string | null {
  const ok = cands.filter((b) => !used.has(b.problem_code) && !exclude.has(b.problem_code));
  if (!ok.length) return null;
  ok.sort((a, b) => (a.problem_code < b.problem_code ? -1 : a.problem_code > b.problem_code ? 1 : 0));
  return ok[seed % ok.length].problem_code;
}

/** 오답 1건 → 대체 문항 1건 (위 폴백 체인) */
function pickAlternative(src: BankItem, pool: BankItem[], used: Set<string>, exclude: Set<string>): string {
  const seed = seedOf(src.problem_code);
  const sameConcept = src.concept_id ? pool.filter((b) => b.concept_id === src.concept_id) : [];
  const sameUnit = pool.filter((b) => b.unit_code === src.unit_code);
  const byDiff = (l: BankItem[]) => l.filter((b) => b.difficulty === src.difficulty);
  const byType = (l: BankItem[]) => l.filter((b) => b.answer_type === src.answer_type);
  return pickFrom(byType(byDiff(sameConcept)), used, exclude, seed)
    ?? pickFrom(byDiff(sameConcept), used, exclude, seed)
    ?? pickFrom(sameConcept, used, exclude, seed)
    ?? pickFrom(byDiff(sameUnit), used, exclude, seed)
    ?? pickFrom(sameUnit, used, exclude, seed)
    ?? src.problem_code;
}

/** 문항 메타(단원·개념·난이도·문항유형)를 코드로 조회 */
async function loadBankItems(supabase: Sb, codes: string[]): Promise<Map<string, BankItem>> {
  if (!codes.length) return new Map();
  const { data } = await supabase.from("problem").select("problem_code,unit_code,concept_id,difficulty,answer_type").in("problem_code", codes);
  return new Map((data ?? []).map((p) => [p.problem_code as string, p as BankItem]));
}

/** 단원 단위 후보 풀 — 개념 폴백·단원 폴백을 같은 풀에서 처리한다 (PostgREST 1000행 제한이라 페이징) */
async function loadBankPool(supabase: Sb, unitCodes: string[]): Promise<BankItem[]> {
  const units = [...new Set(unitCodes)].filter(Boolean);
  if (!units.length) return [];
  const out: BankItem[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase.from("problem")
      .select("problem_code,unit_code,concept_id,difficulty,answer_type").in("unit_code", units)
      .order("problem_code").range(from, from + page - 1);
    if (error) break;
    const rows = (data ?? []) as BankItem[];
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

/** 학생이 이미 배정받은 적 있는 문항 코드 (재출제에서 제외) */
async function loadAssignedCodes(supabase: Sb, studentIds: string[]): Promise<Map<string, Set<string>>> {
  const byStudent = new Map<string, Set<string>>();
  studentIds.forEach((sid) => byStudent.set(sid, new Set()));
  if (!studentIds.length) return byStudent;
  const { data: ast } = await supabase.from("assignment_student")
    .select("student_id,assignment:assignment_id(paper_id)").in("student_id", studentIds);
  const papers = new Map<string, string[]>();              // paper_id → 해당 문제지를 받은 학생들
  (ast ?? []).forEach((raw) => {
    const x = raw as unknown as { student_id: string; assignment?: { paper_id: string } | null };
    const pid = x.assignment?.paper_id; if (!pid) return;
    const l = papers.get(pid) ?? []; l.push(x.student_id); papers.set(pid, l);
  });
  const paperIds = [...papers.keys()];
  if (!paperIds.length) return byStudent;
  const page = 1000;                                        // PostgREST 기본 1000행 제한 → 페이징
  for (let from = 0; ; from += page) {
    const { data: pp, error } = await supabase.from("paper_problem")
      .select("paper_id,problem_code").in("paper_id", paperIds).order("paper_id").order("ord").range(from, from + page - 1);
    if (error) break;
    const rows = pp ?? [];
    rows.forEach((row) => {
      (papers.get(row.paper_id as string) ?? []).forEach((sid) => byStudent.get(sid)?.add(row.problem_code as string));
    });
    if (rows.length < page) break;
  }
  return byStudent;
}

/**
 * 개념 기준 대체 문항 코드 N개 — 3단계(문항 관계) 에이전트와 문제지 마법사가 공용으로 쓴다.
 * @param problem_code 기준 문항
 * @param limit        뽑을 개수 (기본 3)
 * @param exclude      추가로 빼고 싶은 문항 코드
 * 후보가 모자라면 폴백 체인을 따라 내려가고, 그래도 없으면 반환 개수가 limit 보다 적을 수 있다.
 */
export async function listAlternativeProblems(problem_code: string, limit = 3, exclude: string[] = []): Promise<string[]> {
  const c = await ctx(); if (!c || !problem_code || limit <= 0) return [];
  const srcMap = await loadBankItems(c.supabase, [problem_code]);
  const src = srcMap.get(problem_code); if (!src) return [];
  const pool = await loadBankPool(c.supabase, [src.unit_code]);
  const skip = new Set<string>([problem_code, ...exclude]);
  const used = new Set<string>();
  const out: string[] = [];
  for (let i = 0; i < limit; i += 1) {
    const pickSeed: BankItem = { ...src, problem_code: `${problem_code}#${i}` };   // 회차마다 다른 후보가 나오도록 시드만 흔든다
    const code = pickAlternative(pickSeed, pool, used, skip);
    if (code === pickSeed.problem_code) break;                                     // 남은 후보 없음
    used.add(code); out.push(code);
  }
  return out;
}

/**
 * 오답모음생성 / 오답출제
 * - assign=false (오답모음생성): 실제로 틀린 문항 그대로 모은 문제지를 만든다. (기존 동작 유지)
 * - assign=true  (오답출제):     틀린 문항과 "같은 개념"의 다른 문항으로 바꾼 재시험지를 만들어 바로 배정한다.
 *                               문항 수는 그대로, 이미 틀린 문항·이미 배정받은 문항은 제외.
 * 두 경우 모두 오답 기록(wrong_answer_set/item)에는 실제로 틀린 문항을 남긴다.
 */
export async function makeWrongPaper(asIds: string[], assign = false): Promise<{ error?: string; created: number; skipped: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다.", created: 0, skipped: 0 };
  if (!asIds.length) return { created: 0, skipped: 0 };
  const { data: ast } = await c.supabase.from("assignment_student")
    .select("id,student_id,status,student:student_id(name),assignment:assignment_id(paper_id,paper:paper_id(name,subject))").in("id", asIds);
  const { data: mk } = await c.supabase.from("marking").select("assignment_student_id,problem_code,is_correct").in("assignment_student_id", asIds);

  interface AstRow { id: string; student_id: string; status: string; student?: { name: string };
    assignment?: { paper_id: string; paper?: { name: string; subject: string } } }
  const rows = (ast ?? []) as unknown as AstRow[];
  const wrongOf = (id: string) => (mk ?? []).filter((m) => m.assignment_student_id === id && m.is_correct === false).map((m) => m.problem_code as string);

  // 재출제(assign)일 때만 문제은행 후보 풀·배정 이력을 한 번에 미리 읽는다
  let srcMeta = new Map<string, BankItem>();
  let pool: BankItem[] = [];
  let assignedBy = new Map<string, Set<string>>();
  if (assign) {
    const allWrong = [...new Set(rows.flatMap((r) => wrongOf(r.id)))];
    srcMeta = await loadBankItems(c.supabase, allWrong);
    pool = await loadBankPool(c.supabase, [...srcMeta.values()].map((b) => b.unit_code));
    assignedBy = await loadAssignedCodes(c.supabase, [...new Set(rows.map((r) => r.student_id))]);
  }

  let created = 0, skipped = 0;
  for (const r of rows) {
    const codes = wrongOf(r.id);
    if (r.status !== "marked" || codes.length === 0) { skipped += 1; continue; }

    // 재출제면 같은 개념의 다른 문항으로 교체, 오답모음이면 틀린 문항 그대로
    let paperCodes = codes;
    if (assign) {
      const exclude = new Set<string>([...codes, ...(assignedBy.get(r.student_id) ?? [])]);
      const used = new Set<string>();
      paperCodes = codes.map((code) => {
        const src = srcMeta.get(code);
        const next = src ? pickAlternative(src, pool, used, exclude) : code;
        used.add(next);
        return next;
      });
    }

    const name = `${r.assignment?.paper?.name ?? "문제지"} ${assign ? "오답 재출제" : "오답모음"}`;
    const { data: paper, error: pe } = await c.supabase.from("paper").insert({
      center_id: c.center_id, created_by: c.user.id, name, subject: r.assignment?.paper?.subject ?? "math",
      paper_type: "custom", status: "ready", problem_count: paperCodes.length, tags: ["오답클리닉"],
    }).select("id").single();
    if (pe || !paper) { skipped += 1; continue; }
    await c.supabase.from("paper_problem").insert(paperCodes.map((code, i) => ({ paper_id: paper.id, center_id: c.center_id, ord: i + 1, problem_code: code })));
    const { data: set } = await c.supabase.from("wrong_answer_set").insert({
      center_id: c.center_id, student_id: r.student_id, name: `${r.student?.name ?? ""} ${name}`.trim(), paper_id: paper.id, created_by: c.user.id,
    }).select("id").single();
    // 오답 기록은 항상 "실제로 틀린 문항" 기준 (오답출제 완료 여부 판정용)
    if (set) await c.supabase.from("wrong_answer_item").insert(codes.map((code) => ({ set_id: set.id, center_id: c.center_id, problem_code: code, source_assignment_student_id: r.id })));
    if (assign) {
      const { data: asg } = await c.supabase.from("assignment").insert({ center_id: c.center_id, paper_id: paper.id, assigned_by: c.user.id }).select("id").single();
      if (asg) await c.supabase.from("assignment_student").insert({ center_id: c.center_id, assignment_id: asg.id, student_id: r.student_id, status: "assigned" });
      paperCodes.forEach((code) => assignedBy.get(r.student_id)?.add(code));   // 같은 실행 안에서 중복 배정 방지
    }
    created += 1;
  }
  revalidatePath("/clinic/studentmark"); revalidatePath("/paper/mypaper");
  return { created, skipped };
}

/* ------------------------------------------------------------------ *
 * 문제지 배정 · 채점
 * ------------------------------------------------------------------ */
export async function assignPaper(paper_id: string, student_ids: string[], class_id?: string): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (student_ids.length === 0) return { error: "배정할 학생을 선택해주세요." };
  const { data: asg, error: ae } = await c.supabase.from("assignment")
    .insert({ center_id: c.center_id, paper_id, class_id: class_id || null, assigned_by: c.user.id })
    .select("id").single();
  if (ae || !asg) return { error: "배정에 실패했습니다." };
  const rows = student_ids.map((sid) => ({ center_id: c.center_id, assignment_id: asg.id, student_id: sid, status: "assigned" }));
  const { error: se } = await c.supabase.from("assignment_student").insert(rows);
  if (se) { await c.supabase.from("assignment").delete().eq("id", asg.id); return { error: "학생 배정에 실패했습니다." }; }
  revalidatePath("/clinic/studentmark"); revalidatePath("/clinic/class");
  return {};
}

export async function listAssignments(onlyUnmarked = false): Promise<AssignmentRow[]> {
  const c = await ctx(); if (!c) return [];
  let q = c.supabase.from("assignment_student")
    .select("id,status,correct_count,score,marked_at,student:student_id(id,name),assignment:assignment_id(assigned_at,paper:paper_id(id,name,subject,problem_count))")
    .is("deleted_at", null).order("id", { ascending: false });
  if (onlyUnmarked) q = q.neq("status", "marked");
  const { data } = await q;
  return (data ?? []).map((r) => {
    const x = r as unknown as { id: string; status: string; correct_count: number | null; score: number | null; marked_at: string | null;
      student?: { id: string; name: string }; assignment?: { assigned_at: string; paper?: { id: string; name: string; subject: string; problem_count: number } } };
    return {
      as_id: x.id, student_id: x.student?.id ?? "", student_name: x.student?.name ?? "",
      paper_id: x.assignment?.paper?.id ?? "", paper_name: x.assignment?.paper?.name ?? "",
      subject: x.assignment?.paper?.subject ?? "", problem_count: x.assignment?.paper?.problem_count ?? 0,
      status: x.status, correct_count: x.correct_count, score: x.score, assigned_at: x.assignment?.assigned_at ?? "", marked_at: x.marked_at,
    };
  }) as AssignmentRow[];
}

export interface MarkProblem { problem_code: string; ord: number; answer_index: number | null; question_preview: string }

export async function loadMarkingSheet(as_id: string): Promise<{ paper_name: string; problems: MarkProblem[]; existing: Record<string, boolean> }> {
  const c = await ctx(); if (!c) return { paper_name: "", problems: [], existing: {} };
  const { data: as } = await c.supabase.from("assignment_student").select("assignment:assignment_id(paper_id,paper:paper_id(name))").eq("id", as_id).maybeSingle();
  const paperId = (as as unknown as { assignment?: { paper_id?: string } })?.assignment?.paper_id;
  const paperName = (as as unknown as { assignment?: { paper?: { name?: string } } })?.assignment?.paper?.name ?? "";
  if (!paperId) return { paper_name: "", problems: [], existing: {} };
  const { data: pp } = await c.supabase.from("paper_problem").select("ord,problem_code").eq("paper_id", paperId).order("ord");
  const codes = (pp ?? []).map((r) => r.problem_code);
  const { data: probs } = await c.supabase.from("problem").select("problem_code,answer_index,question").in("problem_code", codes.length ? codes : ["__none__"]);
  const pmap = new Map((probs ?? []).map((p) => [p.problem_code, p]));
  const problems: MarkProblem[] = (pp ?? []).map((r) => {
    const p = pmap.get(r.problem_code) as { answer_index: number | null; question: { text?: string }[] } | undefined;
    const preview = (p?.question ?? []).map((b) => b.text ?? "").join(" ").slice(0, 40);
    return { problem_code: r.problem_code, ord: r.ord, answer_index: p?.answer_index ?? null, question_preview: preview };
  });
  const { data: existing } = await c.supabase.from("marking").select("problem_code,is_correct").eq("assignment_student_id", as_id);
  const ex: Record<string, boolean> = {};
  (existing ?? []).forEach((m) => { ex[m.problem_code] = m.is_correct as boolean; });
  return { paper_name: paperName, problems, existing: ex };
}

export async function saveMarking(as_id: string, results: { problem_code: string; is_correct: boolean }[]): Promise<{ error?: string; score?: number; correct?: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  await c.supabase.from("marking").delete().eq("assignment_student_id", as_id);
  const rows = results.map((r) => ({ assignment_student_id: as_id, center_id: c.center_id, problem_code: r.problem_code, is_correct: r.is_correct }));
  if (rows.length) { const { error } = await c.supabase.from("marking").insert(rows); if (error) return { error: "채점 저장에 실패했습니다." }; }
  const correct = results.filter((r) => r.is_correct).length;
  const score = results.length ? Math.round((correct / results.length) * 100) : 0;
  await c.supabase.from("assignment_student").update({ status: "marked", correct_count: correct, score, marked_at: new Date().toISOString(), marked_by: c.user.id }).eq("id", as_id);
  revalidatePath("/clinic/studentmark"); revalidatePath("/clinic/class");
  return { score, correct };
}

export async function listAssignableStudents(): Promise<{ id: string; name: string; grade: string }[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").is("deleted_at", null).order("name");
  return (data ?? []) as { id: string; name: string; grade: string }[];
}

/* ------------------------------------------------------------------ *
 * 학습 분석 보고서(분석표)
 * ------------------------------------------------------------------ */
export interface ReportRow { student_id: string; student_name: string; grade: string; marked: number; assigned: number; avg_score: number | null }
export async function studentReport(): Promise<ReportRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data: students } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").is("deleted_at", null).order("name");
  const { data: asg } = await c.supabase.from("assignment_student").select("student_id,status,score").is("deleted_at", null);
  const byStudent = new Map<string, { marked: number; assigned: number; sum: number }>();
  (asg ?? []).forEach((a) => {
    const s = byStudent.get(a.student_id) ?? { marked: 0, assigned: 0, sum: 0 };
    s.assigned += 1;
    if (a.status === "marked") { s.marked += 1; s.sum += Number(a.score ?? 0); }
    byStudent.set(a.student_id, s);
  });
  return (students ?? []).map((st) => {
    const s = byStudent.get(st.id) ?? { marked: 0, assigned: 0, sum: 0 };
    return { student_id: st.id, student_name: st.name, grade: st.grade, marked: s.marked, assigned: s.assigned,
      avg_score: s.marked ? Math.round(s.sum / s.marked) : null };
  });
}

export interface ClassMarkRow { class_id: string; class_name: string; total: number; marked: number; avg_score: number | null }
export async function classMarkSummary(): Promise<ClassMarkRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data: classes } = await c.supabase.from("class_group").select("id,name").eq("is_active", true).order("name");
  const { data: asg } = await c.supabase.from("assignment").select("class_id,assignment_student(status,score,deleted_at)").not("class_id", "is", null).is("deleted_at", null);
  const byClass = new Map<string, { total: number; marked: number; sum: number }>();
  (asg ?? []).forEach((a) => {
    const rows = (a as unknown as { class_id: string; assignment_student?: { status: string; score: number | null; deleted_at: string | null }[] });
    const s = byClass.get(rows.class_id) ?? { total: 0, marked: 0, sum: 0 };
    (rows.assignment_student ?? []).forEach((x) => {
      if (x.deleted_at) return;
      s.total += 1; if (x.status === "marked") { s.marked += 1; s.sum += Number(x.score ?? 0); }
    });
    byClass.set(rows.class_id, s);
  });
  return (classes ?? []).map((cl) => {
    const s = byClass.get(cl.id) ?? { total: 0, marked: 0, sum: 0 };
    return { class_id: cl.id, class_name: cl.name, total: s.total, marked: s.marked, avg_score: s.marked ? Math.round(s.sum / s.marked) : null };
  });
}

export interface AnalysisRow {
  id: string; name: string; student_id: string; student_name: string; code: string; label: string;
  period_start: string | null; period_end: string | null; created_at: string;
  home_sent_at: string | null; sms_req_at: string | null; kakao_sent_at: string | null;
  stats: { assigned: number; marked: number; avg_score: number | null; wrong: number };
}
export interface AnalysisFilter { start?: string; end?: string; searchField?: string; keyword?: string; code?: string; homeYn?: string; kakaoYn?: string; smsYn?: string }

interface ReportPayload { code?: string; label?: string; home_sent_at?: string | null; sms_req_at?: string | null; kakao_sent_at?: string | null; stats?: AnalysisRow["stats"] }

export async function listAnalysisReports(f: AnalysisFilter = {}): Promise<AnalysisRow[]> {
  const c = await ctx(); if (!c) return [];
  const { data } = await c.supabase.from("report")
    .select("id,name,student_id,kind,period_start,period_end,payload,created_at,student:student_id(name)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []).map((raw) => {
    const r = raw as unknown as { id: string; name: string; student_id: string; kind: string; period_start: string | null; period_end: string | null;
      payload: ReportPayload | null; created_at: string; student?: { name: string } | null };
    const p = r.payload ?? {};
    return {
      id: r.id, name: r.name, student_id: r.student_id, student_name: r.student?.name ?? "",
      code: p.code ?? "R201", label: p.label ?? "종합학습분석표",
      period_start: r.period_start, period_end: r.period_end, created_at: r.created_at,
      home_sent_at: p.home_sent_at ?? null, sms_req_at: p.sms_req_at ?? null, kakao_sent_at: p.kakao_sent_at ?? null,
      stats: p.stats ?? { assigned: 0, marked: 0, avg_score: null, wrong: 0 },
    } as AnalysisRow;
  });
  return rows.filter((r) => {
    const d = dOnly(r.created_at);
    if (f.start && d < f.start) return false;
    if (f.end && d > f.end) return false;
    if (f.code && r.code !== f.code) return false;
    if (f.homeYn === "Y" && !r.home_sent_at) return false;
    if (f.homeYn === "N" && r.home_sent_at) return false;
    if (f.smsYn === "Y" && !r.sms_req_at) return false;
    if (f.smsYn === "N" && r.sms_req_at) return false;
    if (f.kakaoYn === "Y" && !r.kakao_sent_at) return false;
    if (f.kakaoYn === "N" && r.kakao_sent_at) return false;
    const kw = (f.keyword ?? "").trim();
    if (kw) {
      const hay = f.searchField === "reportnm" ? r.name : f.searchField === "studentnm" ? r.student_name : `${r.name} ${r.student_name}`;
      if (!hay.toLowerCase().includes(kw.toLowerCase())) return false;
    }
    return true;
  });
}

/** 분석표 만들기 — 선택한 학생들의 채점 데이터로 분석표(report) 생성 */
export async function createAnalysisReports(input: { student_ids: string[]; code: string; label: string; start?: string; end?: string }): Promise<{ error?: string; created: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다.", created: 0 };
  if (!input.student_ids.length) return { error: "학생을 선택해주세요", created: 0 };
  const kind = input.code === "R205" ? "wrong" : input.code === "R202" || input.code === "R206" ? "book" : "total";
  const { data: students } = await c.supabase.from("student").select("id,name").in("id", input.student_ids);
  const { data: ast } = await c.supabase.from("assignment_student").select("id,student_id,status,score,marked_at").in("student_id", input.student_ids).is("deleted_at", null);
  const { data: mk } = await c.supabase.from("marking").select("assignment_student_id,is_correct");
  const wrongBy = new Map<string, number>();
  (mk ?? []).forEach((m) => { if (m.is_correct === false) wrongBy.set(m.assignment_student_id as string, (wrongBy.get(m.assignment_student_id as string) ?? 0) + 1); });
  const now = fmtISO();
  const rows = (students ?? []).map((st) => {
    const mine = (ast ?? []).filter((a) => a.student_id === st.id
      && (!input.start || !a.marked_at || dOnly(a.marked_at as string) >= input.start)
      && (!input.end || !a.marked_at || dOnly(a.marked_at as string) <= input.end));
    const marked = mine.filter((a) => a.status === "marked");
    const avg = marked.length ? Math.round(marked.reduce((n, a) => n + Number(a.score ?? 0), 0) / marked.length) : null;
    const wrong = mine.reduce((n, a) => n + (wrongBy.get(a.id as string) ?? 0), 0);
    return {
      center_id: c.center_id, student_id: st.id, kind, name: `${st.name} ${input.label}`,
      period_start: input.start || null, period_end: input.end || null, created_by: c.user.id,
      payload: { code: input.code, label: input.label, home_sent_at: null, sms_req_at: null, kakao_sent_at: null,
        stats: { assigned: mine.length, marked: marked.length, avg_score: avg, wrong }, made_on: now },
    };
  });
  if (!rows.length) return { error: "학생을 선택해주세요", created: 0 };
  const { error } = await c.supabase.from("report").insert(rows);
  if (error) return { error: "분석표 생성에 실패했습니다.", created: 0 };
  revalidatePath("/clinic/report");
  return { created: rows.length };
}

export async function updateAnalysisReport(id: string, patch: { name?: string; start?: string; end?: string }): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  const up: Record<string, unknown> = {};
  if (patch.name !== undefined) up.name = patch.name;
  if (patch.start !== undefined) up.period_start = patch.start || null;
  if (patch.end !== undefined) up.period_end = patch.end || null;
  const { error } = await c.supabase.from("report").update(up).eq("id", id);
  if (error) return { error: "수정에 실패했습니다." };
  revalidatePath("/clinic/report");
  return {};
}

export async function deleteAnalysisReports(ids: string[]): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (!ids.length) return {};
  const { error } = await c.supabase.from("report").delete().in("id", ids);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/clinic/report");
  return {};
}

/** 학생홈 발송 · 문자발송 요청 · 카카오톡 발송 상태 기록 */
export async function markAnalysisSent(ids: string[], channel: "home" | "sms" | "kakao"): Promise<{ error?: string; count: number }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다.", count: 0 };
  if (!ids.length) return { count: 0 };
  const { data } = await c.supabase.from("report").select("id,payload").in("id", ids);
  const field = channel === "home" ? "home_sent_at" : channel === "sms" ? "sms_req_at" : "kakao_sent_at";
  const now = new Date().toISOString();
  for (const r of data ?? []) {
    const payload = { ...((r.payload ?? {}) as ReportPayload), [field]: now };
    const { error } = await c.supabase.from("report").update({ payload }).eq("id", r.id);
    if (error) return { error: "처리에 실패했습니다.", count: 0 };
  }
  revalidatePath("/clinic/report");
  return { count: (data ?? []).length };
}
