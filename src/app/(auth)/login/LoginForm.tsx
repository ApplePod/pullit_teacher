"use client";

import { useActionState, useEffect, useState } from "react";
import { login } from "../actions";

/** 원본 Pages/Center/Login/login.cshtml 마크업 그대로 */
export function LoginForm({ next, notice, problemCount }: { next: string; notice?: string; problemCount: number }) {
  // 원본 폼에는 hidden input 이 없다 — 값은 제출 시 FormData 에 직접 넣는다
  const [state, action] = useActionState(
    (prev: Awaited<ReturnType<typeof login>>, fd: FormData) => {
      fd.set("next", next);
      fd.set("hold", hold ? "1" : "0");
      return login(prev, fd);
    },
    null,
  );
  const [id, setId] = useState("");
  const [saveId, setSaveId] = useState(false);
  const [hold, setHold] = useState(false);

  // 원본과 같은 키로 아이디 저장 (localStorage "savedWebID") — 첫 페인트 후 한 번만 반영
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem("savedWebID") || "";
        if (saved) { setId(saved); setSaveId(true); }
        if (localStorage.getItem("holdLogin") === "1") setHold(true);
      } catch { /* 저장소 차단 환경 무시 */ }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const onSubmit = () => {
    try {
      if (saveId) localStorage.setItem("savedWebID", id); else localStorage.removeItem("savedWebID");
      localStorage.setItem("holdLogin", hold ? "1" : "0");
    } catch { /* 무시 */ }
  };

  return (
    <section id="wrapapp01">
      <div className="swiper">
        <div className="swiper-wrapper">
          <div className="Benner swiper-slide swiper-slide-active" role="group" aria-label="1 / 1" style={{ width: 500 }}>
            <div className="Profile"><img src="/assets/center/images/common/img_login_cover.png" alt="" /></div>
            <div className="Text-wrap">
              <span>초1~고3 현재 이용 가능 문항수</span>
              <span>{problemCount.toLocaleString()} 문항</span>
            </div>
            <div className="Button-wrap">
              <button id="goremotesupport" type="button" onClick={() => { window.location.href = "https://www.939.co.kr/mmath/"; }}>원격지원 요청</button>
              <button id="gotoattandancekeypad" type="button" onClick={() => { window.location.href = "/attendance-keypad"; }}>스마트 키패드</button>
            </div>
          </div>
        </div>
      </div>
      <form className="Form" action={action} onSubmit={onSubmit}>
        <h2>교실홈 로그인</h2>
        <div className="flex flex-col w-full gap-xl mb-36">
          <div className="form-input-basic">
            <input type="text" name="email" placeholder="아이디를 입력해주세요." maxLength={24}
              autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} />
            {state?.field === "id" && <p>{state.error}</p>}
          </div>
          <div className="form-input-basic">
            <input className="input-basic-2" type="password" name="password" placeholder="비밀번호를 입력해주세요."
              maxLength={24} autoComplete="current-password" />
            {state?.field === "pw" && <p>{state.error}</p>}
            {notice && <p>{notice}</p>}
          </div>
        </div>
        <div className="Checkbox-wrap">
          <div>
            <label>
              <input className="checkbox-red" type="checkbox" checked={saveId} onChange={(e) => setSaveId(e.target.checked)} />
              <span className="custom-checkbox"></span> 아이디 저장 </label>
            <label>
              <input className="checkbox-red" type="checkbox" checked={hold} onChange={(e) => setHold(e.target.checked)} />
              <span className="custom-checkbox"></span> 자동 로그인 </label>
          </div>
          <div><a href="/forgot-password">아이디/비밀번호 찾기</a></div>
        </div>
        <div className="btn-wrap">
          {/* 아이디가 입력되었는지 여부에 따라 버튼 클래스를 변경 */}
          <button type="submit" className={id === "" ? "btn-success" : "btn-primary"}>로그인</button>
        </div>
        <div className="Links-wrap flex-col">
          <a href="/student">학생 홈</a>
        </div>
      </form>
    </section>
  );
}
