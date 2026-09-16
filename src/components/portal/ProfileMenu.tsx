"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { metaAlert } from "./MetaModal";

/** 원본 상단바의 profile-component 영역 마크업 그대로 */
export function ProfileMenu({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const soon = (label: string) => async (e: React.MouseEvent) => { e.preventDefault(); setOpen(false); await metaAlert(`${label} 기능은 준비 중입니다.`); };
  return (
    <profile-component class=" border rounded-1">
      <div className="dropup-center dropup" ref={ref}>
        <button className="dropdown-toggle header-profile-area" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div className="profile-image"><img src="/assets/center/images/common/profile_default.png" alt="" /></div>
          <p className="profile-name d-flex title-line"><span className="line-clamp-1" style={{ maxWidth: 170 }}>{userName}</span> 님 </p>
        </button>
        <ul className={`dropdown-menu${open ? " show" : ""}`} style={open ? { display: "block" } : undefined}>
          <li><Link className="dropdown-item" href="/mypage/profile" onClick={() => setOpen(false)}>프로필 설정</Link></li>
          <li><Link className="dropdown-item" href="/mypage/calculate" onClick={() => setOpen(false)}>정산 관리</Link></li>
          <li><a className="dropdown-item" href="#" onClick={soon("QR채점")}>QR채점</a></li>
          <li><a className="dropdown-item" href="/attendance-keypad" onClick={() => setOpen(false)}>출결키패드</a></li>
          <li><a className="dropdown-item" href="https://infrequent-christmas-093.notion.site/15581d9dd28d464b9d6a8495cb51cbb5" target="_blank" rel="noreferrer">메뉴얼</a></li>
          <li><Link className="dropdown-item" href="/help/notice" onClick={() => setOpen(false)}>고객센터</Link></li>
          <li><a className="dropdown-item" href="https://www.939.co.kr/mmath/" target="_blank" rel="noreferrer">원격지원</a></li>
          <li><form action={logout}><button type="submit" className="dropdown-item">로그아웃</button></form></li>
        </ul>
      </div>
    </profile-component>
  );
}
