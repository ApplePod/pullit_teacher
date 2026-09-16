import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthedUser { id: string; email?: string }

/**
 * 로그인 사용자를 가능한 한 네트워크 없이 확인한다.
 * 프로젝트가 ES256(비대칭) 서명키를 쓰므로 getClaims() 는 JWKS 로 로컬 검증한다.
 * 토큰이 만료·부재면 getUser() 로 넘어가 갱신까지 처리한다.
 */
export async function getAuthedUser(supabase: SupabaseClient): Promise<AuthedUser | null> {
  try {
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims as { sub?: string; email?: string } | undefined;
    if (!error && claims?.sub) return { id: claims.sub, email: claims.email };
  } catch { /* 아래 getUser 로 폴백 */ }
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? undefined } : null;
}

/** id 만 필요할 때 */
export async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  return (await getAuthedUser(supabase))?.id ?? null;
}
