"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { toEmail } from "@/lib/login-id";

export type ActionState = { error?: string; message?: string; field?: "id" | "pw" } | null;


/** 원본 login.cshtml 과 동일한 검증 문구 (checkreslt: id/id2/pw/pw2) */
export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const loginId = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/dashboard";
  const holdLogin = String(formData.get("hold") ?? "") === "1";

  if (!loginId) return { error: "아이디를 입력하세요!", field: "id" };
  if (!password) return { error: "비밀번호를 입력하세요!", field: "pw" };

  const supabase = await createClient({ sessionOnly: !holdLogin });
  const { error } = await supabase.auth.signInWithPassword({ email: toEmail(loginId), password });
  if (error) {
    // 원본은 아이디 존재 여부에 따라 문구가 다르다
    const exists = await loginIdExists(loginId);
    return exists
      ? { error: "비밀번호가 일치하지 않습니다.", field: "pw" }
      : { error: "등록되지 않은 아이디 입니다.", field: "id" };
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

/** 아이디 등록 여부 확인 (원본과 같은 안내를 위해) */
async function loginIdExists(loginId: string): Promise<boolean> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const target = toEmail(loginId).toLowerCase();
    return (data?.users ?? []).some((u) => (u.email ?? "").toLowerCase() === target);
  } catch {
    return true; // 확인 불가 시에는 비밀번호 오류로 안내
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "이메일을 입력해주세요." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: "메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요." };
  return { message: "비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요." };
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다." };
  redirect("/dashboard");
}
