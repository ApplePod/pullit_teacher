import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "풀잇 학원 포털",
  description: "풀잇 문항으로 문제지를 만들고 학원을 관리하는 포털",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 외부 폰트·아이콘 호스트 연결을 미리 열어 첫 렌더 지연을 줄인다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* style.css 안의 @import 와 같은 주소 — 먼저 걸어 두면 체인이 아니라 병렬로 받는다 */}
        <link rel="stylesheet" href="/assets/center/css/swiper-bundle.css" />
        <link rel="stylesheet" href="/assets/center/css/bootstrap.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sunn-us/SUITE/fonts/static/woff2/SUITE.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.7/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        <link rel="stylesheet" href="/legacy/css/style.css" />
        <link rel="stylesheet" href="/legacy/css/style-new.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
