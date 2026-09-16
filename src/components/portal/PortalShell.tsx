"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { MetaModalHost } from "./MetaModal";
import { TutorialArea } from "./TutorialArea";

/** 원본 실측: 아래 화면들은 #wrap 안에 #wrap 이 한 겹 더 있다 */
const NESTED_WRAP = ["/dashboard", "/management/class", "/management/teacher", "/management/statistic", "/management/centerinfo", "/mypage/profile"];

/** 원본은 화면마다 #contents 에 레이아웃 클래스를 붙인다(dashboard expanded / include-all / include-left). */
function contentsClass(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "dashboard";  // 원본 기본값(expanded 는 구 사이드바 스크립트 산물)
  if (pathname.startsWith("/management/attendance")) return "include-all";
  if (pathname.startsWith("/management") || pathname.startsWith("/mypage")) return "include-left";
  return "include-all"; // 문제지·채점&클리닉·그 외
}

/** 원본 DOM 구조 그대로: body > .contents-header__new + #wrap > #contents */
export function PortalShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname() || "";
  return (
    <>
      <TopNav userName={userName} />
      <div id="wrap">
        {/* 원본은 #wrap 첫 자식으로 튜토리얼 버튼 영역이 온다 */}
        <TutorialArea />
        {NESTED_WRAP.some((p) => pathname === p || pathname.startsWith(p + "/")) ? (
          <div id="wrap">
            <article id="contents" className={contentsClass(pathname)}>{children}</article>
          </div>
        ) : (
          <article id="contents" className={contentsClass(pathname)}>{children}</article>
        )}
      </div>
      <MetaModalHost />
    </>
  );
}
