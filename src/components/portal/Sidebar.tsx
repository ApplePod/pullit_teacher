"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/(auth)/actions";

export const MENUS = [
  { key: "paper", icon: "contract_edit", label: "문제지 보관함", items: [
    ["/paper/mypaper", "내 문제지"], ["/paper/favorite", "즐겨찾기"], ["/paper/share", "공유 문제지"], ["/paper/theme", "테마별 문제지"], ["/paper/trash", "휴지통"],
  ]},
  { key: "clinic", icon: "clinical_notes", label: "채점&클리닉", items: [
    ["/clinic/studentmark", "학생별 채점"], ["/clinic/class", "반별 채점"], ["/clinic/report", "학습 분석 보고서"],
  ]},
  { key: "manage", icon: "manage_accounts", label: "관리", items: [
    ["/management/attendance", "출결현황"], ["/management/statistic", "학습현황"], ["/management/student", "학생등록"],
    ["/management/book", "사용교재"], ["/management/teacher", "교사등록"], ["/management/class", "반 편성"], ["/management/centerinfo", "학원정보"],
  ]},
] as const;

export function Sidebar({ userName, collapsed, onToggle }: { userName: string; collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className={`left-aside${collapsed ? " collapsed" : ""}`}>
      <div className="left-aside__logo">
        <Link href="/dashboard" className="home-button">
          <img src="/assets/center/images/common/logo.svg" alt="" />
          <p className="hide-element"><img src="/assets/center/images/common/logo-title.svg" alt="풀잇" /></p>
        </Link>
        <a href="#" className="expanded-button hide-element" onClick={(e) => { e.preventDefault(); onToggle(); }}>
          <img src="/assets/center/images/common/expanded.svg" alt="닫기" />
        </a>
      </div>
      <ul className="left-aside__list">
        {MENUS.map((m) => {
          const active = m.items.some(([href]) => pathname.startsWith(href));
          const isOpen = open === m.key || (open === null && active);
          return (
            <li key={m.key} className={`left-aside__item${active ? " active" : ""}`}>
              <a href="#" className={isOpen ? "active" : ""} data-menu={m.key}
                onClick={(e) => { e.preventDefault(); setOpen(isOpen ? "" : m.key); }}>
                <span className="material-symbols-sharp">{m.icon}</span>
                <p className="text hide-element">{m.label}</p>
              </a>
              <div className="drop-items">
                {m.items.map(([href, label]) => (
                  <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""}>{label}</Link>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="left-aside__profile">
        <div className="dropup-center dropup">
          <button className="dropdown-toggle profile-area" type="button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}>
            <div className="profile-image"><img src="/assets/center/images/common/profile_default.png" alt="" /></div>
            <p className="profile-name hide-element">{userName}</p>
          </button>
          <ul className={`dropdown-menu${profileOpen ? " show" : ""}`} data-bs-popper="static">
            <li><Link className="dropdown-item" href="/mypage/profile" onClick={() => setProfileOpen(false)}>프로필 설정</Link></li>
            <li><form action={logout}><button type="submit" className="dropdown-item">로그아웃</button></form></li>
          </ul>
        </div>
        <a className="profile-expanded-button" href="#" onClick={(e) => { e.preventDefault(); onToggle(); }}>
          <span className="material-symbols-sharp">chevron_left</span>
        </a>
      </div>
    </aside>
  );
}
