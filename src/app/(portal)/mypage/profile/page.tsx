import { requireUser } from "@/lib/auth";
import { displayLoginId } from "@/lib/login-id";
import { ContentsHeader } from "@/components/portal/ContentsHeader";
import { ProfileForm, PasswordForm } from "./forms";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  return (
    <>
      <ContentsHeader icon="manage_accounts" title="마이페이지" userName={profile.name} />
      <div className="contens-body">
        <ul className="list-tab" role="tablist">
          <li className="nav-item"><button className="nav-link active" type="button">프로필 설정</button></li>
        </ul>
        <div className="mypage">
          <div className="mypage__wrap mypage__wrap--1 mt-24">
            <div className="profile__header">
              <div className="profile__image">
                <button type="button"><img src="/assets/center/images/common/profile_default.png" alt="" /></button>
              </div>
              <div className="d-flex items-center justify-content-between gap-3 w-full flex-right">
                <blockquote><h4>{profile.name}</h4></blockquote>
                <span className="f-12 bw6">{profile.role === "owner" ? "원장" : "강사"}</span>
              </div>
            </div>
            <ProfileForm name={profile.name} phone={profile.phone ?? ""} loginId={displayLoginId(user.email)} />
          </div>
        </div>
        <div className="mt-20 mypage">
          <div className="mypage__wrap mypage__wrap--1">
            <PasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}
