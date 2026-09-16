"use server";
import { createClient } from "@/lib/supabase/server";
export interface Stat { students: number; classes: number; teachers: number; papers: number; assignments: number; marked: number; avgScore: number | null; attendanceThisMonth: number }
async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase } : null;
}
export async function loadStats(): Promise<Stat> {
  const empty = { students: 0, classes: 0, teachers: 0, papers: 0, assignments: 0, marked: 0, avgScore: null, attendanceThisMonth: 0 };
  const c = await ctx(); if (!c) return empty;
  const s = c.supabase;
  const students = (await s.from("student").select("*", { count: "exact", head: true }).neq("state", "left")).count ?? 0;
  const classes = (await s.from("class_group").select("*", { count: "exact", head: true }).eq("is_active", true)).count ?? 0;
  const teachers = (await s.from("profile").select("*", { count: "exact", head: true })).count ?? 0;
  const papers = (await s.from("paper").select("*", { count: "exact", head: true }).is("deleted_at", null)).count ?? 0;
  const assignments = (await s.from("assignment_student").select("*", { count: "exact", head: true })).count ?? 0;
  const { data: marks } = await s.from("assignment_student").select("score").eq("status", "marked");
  const marked = (marks ?? []).length;
  const avgScore = marked ? Math.round((marks ?? []).reduce((a, m) => a + (m.score ?? 0), 0) / marked) : null;
  const ym = new Date().toISOString().slice(0, 7);
  const att = (await s.from("attendance").select("*", { count: "exact", head: true }).gte("attended_on", `${ym}-01`)).count ?? 0;
  return { students, classes, teachers, papers, assignments, marked, avgScore, attendanceThisMonth: att };
}
