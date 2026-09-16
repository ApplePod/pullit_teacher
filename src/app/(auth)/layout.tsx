import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="detail">
        <div className="header-wrap">
          <Link href="/" className="logo" aria-label="풀잇 학원 포털">
            <img src="/assets/home/images/common/logo.svg" alt="풀잇 학원 포털" />
          </Link>
        </div>
      </header>
      <main className="Login">
        <section>
          <div className="Benner">
            <div className="Profile">
              <img src="/assets/center/images/common/img_login_cover.png" alt="" />
            </div>
            <div className="Text-wrap">
              <span>초1~고3 현재 이용 가능 문항수</span>
              <span>739,860 문항</span>
            </div>
          </div>
          {children}
        </section>
      </main>
    </>
  );
}
