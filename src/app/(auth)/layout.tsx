/** 원본 login.cshtml 의 상단 구조 그대로: header.detail > .header-wrap > a.logo */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 원본 로그인 화면은 문제은행 CSS 2종을 함께 로드한다 (input position 등 미세 스타일이 여기서 온다) */}
      <link rel="stylesheet" href="/legacy/css/edbank/neq.css" />
      <link rel="stylesheet" href="/legacy/css/edbank/bank.css" />
      <header className="detail">
        <div className="header-wrap">
          {/* 원본 마크업 그대로(<a href="/">) — 배경 이미지로 로고를 표시한다 */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="logo" aria-label="메타수학"></a>
        </div>
      </header>
      <main className="Login">{children}</main>
    </>
  );
}
