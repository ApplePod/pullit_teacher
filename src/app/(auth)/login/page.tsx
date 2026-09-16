import Link from "next/link";
import { LoginForm } from "./LoginForm";

const ERROR_TEXT: Record<string, string> = {
  no_profile: "학원 프로필이 아직 등록되지 않은 계정입니다. 관리자에게 문의해주세요.",
  auth_callback: "인증 링크가 유효하지 않습니다. 다시 시도해주세요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <>
      {error && ERROR_TEXT[error] && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{ERROR_TEXT[error]}</p>
      )}
      <LoginForm next={next ?? "/dashboard"} />
      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-slate-500 hover:text-slate-900">
          비밀번호를 잊으셨나요?
        </Link>
      </div>
    </>
  );
}
