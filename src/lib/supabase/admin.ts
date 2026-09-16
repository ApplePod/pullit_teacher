import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/** service_role 키를 쓰는 서버 전용 관리자 클라이언트. RLS 우회. 서버 액션에서만 사용. */
export function createAdminClient() {
  const { url } = supabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
