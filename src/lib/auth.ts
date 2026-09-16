import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Center, Profile } from "@/lib/types";

/** 로그인 사용자 + profile + center. 없으면 /login 으로. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) {
    // auth 계정은 있으나 학원 프로필이 없는 상태 (가입 처리 미완)
    redirect("/login?error=no_profile");
  }

  const { data: center } = await supabase
    .from("center")
    .select("*")
    .eq("id", profile.center_id)
    .maybeSingle<Center>();

  return { user, profile, center: center! };
}
