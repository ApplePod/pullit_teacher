/** 학생 홈은 이번 복원 범위(학원 포털) 밖이라 안내만 제공한다. 링크가 404 가 되지 않도록 유지. */
export default function StudentHomePage() {
  return (
    <main className="Login">
      <section style={{ display: "block", padding: "80px 48px", textAlign: "center" }}>
        <h2 style={{ marginBottom: 12 }}>학생 홈</h2>
        <p className="f-14 bw5">학생 홈은 준비 중입니다. 교실홈(학원 포털)에서 먼저 이용해 주세요.</p>
        <div className="btn-wrap" style={{ marginTop: 24 }}>
          <a className="btn-primary" href="/login" style={{ display: "inline-block", padding: "0 24px", lineHeight: "42px" }}>교실홈 로그인</a>
        </div>
      </section>
    </main>
  );
}
