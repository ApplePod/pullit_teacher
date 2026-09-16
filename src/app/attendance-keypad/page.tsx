/** 태블릿 출결 키패드는 이번 복원 범위 밖이라 안내만 제공한다. */
export default function AttendanceKeypadPage() {
  return (
    <main className="Login">
      <section style={{ display: "block", padding: "80px 48px", textAlign: "center" }}>
        <h2 style={{ marginBottom: 12 }}>스마트 키패드</h2>
        <p className="f-14 bw5">태블릿 출결 키패드는 준비 중입니다. 출결은 교실홈 &gt; 관리 &gt; 출결에서 입력할 수 있습니다.</p>
        <div className="btn-wrap" style={{ marginTop: 24 }}>
          <a className="btn-primary" href="/login" style={{ display: "inline-block", padding: "0 24px", lineHeight: "42px" }}>교실홈 로그인</a>
        </div>
      </section>
    </main>
  );
}
