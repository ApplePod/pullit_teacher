import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";

export function ContentsHeader({ icon, title, userName, crumbs }: { icon: string; title: string; userName: string; crumbs?: string[] }) {
  return (
    <div className="contents-header">
      <div className="contents-header__wrap">
        <div className={`left-area${crumbs ? " contents-header__detail mt-20" : ""}`}>
          {crumbs ? (
            <div className="bread-crumbs">{crumbs.map((c) => <span key={c}>{c}</span>)}</div>
          ) : (
            <span className="material-symbols-sharp">{icon}</span>
          )}
          <h2>{title}</h2>
        </div>
        <div className="right-area">
          <Link href="/paper/make" className="button__line button__fill--medium button__fill--red">
            <i className="fa-solid fa-pencil" aria-hidden="true"></i> 문제지 만들기
          </Link>
          <div className="notification-wrap">
            <button type="button" className="button__alram">
              <span className="material-symbols-sharp">notifications</span>
            </button>
          </div>
          <ProfileMenu userName={userName} />
        </div>
      </div>
    </div>
  );
}
