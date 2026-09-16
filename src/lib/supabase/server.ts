import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";

export async function createClient(opts: { sessionOnly?: boolean } = {}) {
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // 자동 로그인 해제 시에는 만료시간 없는 세션 쿠키로 저장한다(원본 bHoldLogin=false)
              cookieStore.set(name, value, opts.sessionOnly ? { ...options, maxAge: undefined, expires: undefined } : options),
            );
          } catch {
            // 서버 컴포넌트에서 호출된 경우 무시 (proxy 가 세션을 갱신함)
          }
        },
      },
    },
  );
}
