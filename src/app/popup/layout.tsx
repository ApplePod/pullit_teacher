import "../globals.css";
import { MetaModalHost } from "@/components/portal/MetaModal";

/** 원본 레이어 팝업(iframe) 안에서 열리는 화면용 — 상단 GNB 없이 본문만 */
export const metadata = { title: "메타수학" };
export default function PopupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="/assets/center/css/swiper-bundle.css" />
        <link rel="stylesheet" href="/legacy/css/bootstrap.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.7/static/pretendard.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        <link rel="stylesheet" href="/legacy/css/style.css" />
        <link rel="stylesheet" href="/legacy/css/style-new.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css" />
      </head>
      <body style={{ background: "#fff" }}>{children}<MetaModalHost /></body>
    </html>
  );
}
