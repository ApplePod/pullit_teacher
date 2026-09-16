"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "./ProfileMenu";
import { useLayerPopup } from "./LayerPopup";
import { useEffect } from "react";

const GNB = [
  { href: "/paper/mypaper", label: "문제지 보관함", match: "/paper" },
  { href: "/clinic/studentmark", label: "채점&클리닉", match: "/clinic" },
  { href: "/premium/video", label: "프리미엄", match: "/premium" },
  { href: "/management/student", label: "관리", match: ["/management", "/mypage"] },
] as const;

export function TopNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const layer = useLayerPopup({ global: true });
  useEffect(() => { const onMsg = (e: MessageEvent) => { if (e.data?.ptGoto) window.location.href = e.data.ptGoto; }; window.addEventListener("message", onMsg); return () => window.removeEventListener("message", onMsg); }, []);
  const isActive = (m: string | readonly string[]) =>
    Array.isArray(m) ? m.some((x) => pathname.startsWith(x)) : pathname.startsWith(m as string);
  return (
    <>
    {layer.popup}
    <div className="contents-header contents-header__new">
      <div className="contents-header__wrap">
        <div className="left-area contents-header__left">
          <Link href="/dashboard" prefetch={false} className="contents-header__brand">
            <img src="/assets/center/images/common/logo-title.svg" alt="풀잇 학원 포털" />
          </Link>
          <ul className="contents-header__gnb">
            {GNB.map((g) => (
              <li key={g.label}>
                <Link href={g.href} prefetch={false} className={isActive(g.match) ? "active" : ""}>{g.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="right-area">
          <button type="button" className="button__line button__fill--medium button__fill--red" onClick={() => layer.open("/popup/paper/make")}>
            <i className="fa-solid fa-pencil" aria-hidden="true"></i> 문제지 만들기
          </button>
          <div className="notification-wrap border rounded-1">
            <button type="button" className="button__alram">
              <span className="material-symbols-sharp">notifications</span>
            </button>
          </div>
          <ProfileMenu userName={userName} />
        </div>
      </div>
    </div>
    </>
  );
}