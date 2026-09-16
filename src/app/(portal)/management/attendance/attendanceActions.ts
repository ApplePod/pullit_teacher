"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AttStudent { id: string; name: string; grade: string }
export interface AttRecord { student_id: string; attended_on: string; status: string }

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profile").select("center_id").eq("id", user.id).maybeSingle();
  return p ? { supabase, user, center_id: p.center_id } : null;
}

export async function loadMonth(ym: string): Promise<{ students: AttStudent[]; records: AttRecord[] }> {
  const c = await ctx(); if (!c) return { students: [], records: [] };
  const [y, m] = ym.split("-").map(Number);
  const first = `${ym}-01`;
  const last = `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  const { data: students } = await c.supabase.from("student").select("id,name,grade").neq("state", "left").order("name");
  const { data: records } = await c.supabase.from("attendance")
    .select("student_id,attended_on,status").gte("attended_on", first).lte("attended_on", last);
  return { students: (students ?? []) as AttStudent[], records: (records ?? []) as AttRecord[] };
}

export async function setAttendance(student_id: string, attended_on: string, status: string | null): Promise<{ error?: string }> {
  const c = await ctx(); if (!c) return { error: "로그인이 필요합니다." };
  if (status === null) {
    await c.supabase.from("attendance").delete().eq("student_id", student_id).eq("attended_on", attended_on).is("class_id", null);
  } else {
    await c.supabase.from("attendance")
      .upsert({ center_id: c.center_id, student_id, attended_on, status, created_by: c.user.id },
        { onConflict: "student_id,class_id,attended_on" });
  }
  revalidatePath("/management/attendance");
  return {};
}
