import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="detail">
        <div className="header-wrap">
          <Link href="/" className="logo" aria-label="풀잇 학원 포털"><img src="/assets/home/images/common/logo.svg" alt="풀잇 학원 포털" /></Link>
        </div>
      </header>
      <main className="Login">
        <section id="wrapapp01">
          <div className="swiper">
            <div className="swiper-wrapper">
              <div className="Benner swiper-slide swiper-slide-active" style={{ width: 500 }}>
                <div className="Profile">
                  <img src="/assets/center/images/common/img_login_cover.png" alt="" />
                </div>
                <div className="Text-wrap">
                  <span>고3 · 수능형 현재 이용 가능 문항수</span>
                  <span>11,718 문항</span>
                </div>
              </div>
            </div>
          </div>
          {children}
        </section>
      </main>
    </>
  );
}
