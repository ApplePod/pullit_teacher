import { requireUser } from "@/lib/auth";
import { ID_EMAIL_DOMAIN } from "@/lib/login-id";
import { ProfileForm, PasswordForm } from "./forms";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-bold">프로필</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email?.endsWith(`@${ID_EMAIL_DOMAIN}`)
            ? `로그인 아이디: ${user.email.split("@")[0]}`
            : `로그인 이메일: ${user.email}`}
        </p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">기본 정보</h2>
        <ProfileForm name={profile.name} phone={profile.phone ?? ""} />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">비밀번호 변경</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
