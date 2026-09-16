import { createAdminClient } from "@/lib/supabase/admin";
import { LoginForm } from "./LoginForm";

const ERROR_TEXT: Record<string, string> = {
  no_profile: "학원 프로필이 아직 등록되지 않은 계정입니다. 관리자에게 문의해주세요.",
  auth_callback: "인증 링크가 유효하지 않습니다. 다시 시도해주세요.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  // 원본 배너의 '현재 이용 가능 문항수' — 우리 문항 수 (비로그인 화면이라 서버에서 집계)
  let count = 0;
  try {
    const { count: c } = await createAdminClient().from("problem").select("problem_code", { count: "exact", head: true });
    count = c ?? 0;
  } catch { count = 0; }
  return <LoginForm next={next ?? "/dashboard"} notice={error ? ERROR_TEXT[error] : undefined} problemCount={count ?? 0} />;
}
