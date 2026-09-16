import "../globals.css";
import { MetaModalHost } from "@/components/portal/MetaModal";

/** 원본 레이어 팝업(iframe) 안에서 열리는 화면용 — 상단 GNB 없이 본문만 */
export const metadata = { title: "메타수학" };
export default function PopupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 외부 호스트 연결 미리 열기 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* 라이브 원본이 로드하는 스타일시트 세트와 동일 (style.css 가 @import 하는 것은 체인을 피하려고 먼저 선언) */}
        <link rel="stylesheet" href="/assets/center/css/swiper-bundle.css" />
        <link rel="stylesheet" href="/assets/center/css/bootstrap.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sunn-us/SUITE/fonts/static/woff2/SUITE.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.7/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="preconnect" href="https://ka-p.fontawesome.com" crossOrigin="" />
        <link rel="stylesheet" href="https://ka-p.fontawesome.com/releases/v6.7.2/css/pro.min.css?token=c57ecb994b" />
        <link rel="stylesheet" href="/legacy/css/style.css" />
        <link rel="stylesheet" href="/legacy/css/style-new.css" />
        <link rel="stylesheet" href="/Scripts/daterangepicker.css" />
        <link rel="stylesheet" href="/Content/themes/base/jquery.ui.all.css" />
        <link rel="stylesheet" href="/Assets2/css/problem.css" />
        <link rel="stylesheet" href="/assets/common/onboarding/style.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css" />
      </head>
      <body style={{ background: "#fff" }}>{children}<MetaModalHost /></body>
    </html>
  );
}
