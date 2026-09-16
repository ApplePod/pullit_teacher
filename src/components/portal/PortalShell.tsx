"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { MetaModalHost } from "./MetaModal";

/** 원본은 화면마다 #contents 에 레이아웃 클래스를 붙인다(dashboard / include-all / include-left). */
function contentsClass(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/management/attendance")) return "include-all";
  if (pathname.startsWith("/management") || pathname.startsWith("/mypage")) return "include-left";
  return "include-all"; // 문제지·채점&클리닉·그 외
}

/** 원본 DOM 구조 그대로: body > .contents-header__new + #contents (래퍼 없음) */
export function PortalShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname() || "";
  return (
    <>
      <TopNav userName={userName} />
      <article id="contents" className={contentsClass(pathname)}>{children}</article>
      <MetaModalHost />
    </>
  );
}
