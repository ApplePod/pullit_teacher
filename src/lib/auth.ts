import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/claims";
import type { Center, Profile } from "@/lib/types";

/**
 * 로그인 사용자 + profile + center. 없으면 /login 으로.
 * - 토큰 검증은 로컬(JWKS) → 인증 서버 왕복 제거
 * - profile 과 center 를 한 번의 조인 쿼리로 조회(왕복 2회 → 1회)
 * - 같은 렌더 안에서 여러 번 불려도 한 번만 실행(react cache)
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const authed = await getAuthedUser(supabase);
  if (!authed) redirect("/login");

  const { data: profile } = await supabase
    .from("profile")
    .select("*, center:center_id(*)")
    .eq("id", authed.id)
    .maybeSingle<Profile & { center: Center | null }>();

  if (!profile) {
    // auth 계정은 있으나 학원 프로필이 없는 상태 (가입 처리 미완)
    redirect("/login?error=no_profile");
  }

  const { center, ...rest } = profile;
  return { user: authed, profile: rest as Profile, center: center as Center };
});
