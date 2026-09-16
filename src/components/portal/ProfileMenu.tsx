"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/(auth)/actions";

export function ProfileMenu({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dropup-center dropup">
      <button className="dropdown-toggle header-profile-area" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="profile-image"><img src="/assets/center/images/common/profile_default.png" alt="" /></div>
        <p className="profile-name"><span>{userName}</span> 님</p>
      </button>
      <ul className={`dropdown-menu${open ? " show" : ""}`} data-bs-popper="static">
        <li><Link className="dropdown-item" href="/mypage/profile" onClick={() => setOpen(false)}>프로필 설정</Link></li>
        <li><form action={logout}><button type="submit" className="dropdown-item">로그아웃</button></form></li>
      </ul>
    </div>
  );
}
