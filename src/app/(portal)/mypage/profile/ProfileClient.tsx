"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { metaAlert } from "@/components/portal/MetaModal";
import { saveProfile, verifyCurrentPassword, setNewPassword } from "./actions";

const DEFAULT_AVATAR = "/assets/center/images/common/profile_default.png";

/** 원본 마이페이지 프로필 설정(profile.cshtml) 마크업 그대로 + 저장·비밀번호 변경 동작 */
export function ProfileClient({ name, phone, loginId }: { name: string; phone: string; loginId: string }) {
  const router = useRouter();
  const [view, setView] = useState<"profile" | "password">("profile");
  const [f, setF] = useState({ name, phone });
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [pending, start] = useTransition();

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { metaAlert("이미지 파일만 업로드 가능해요."); return; }
    const reader = new FileReader();
    reader.onload = () => { setAvatar(String(reader.result)); setAvatarTouched(true); };
    reader.readAsDataURL(file);
  };

  const save = () => start(async () => {
    const r = await saveProfile(f);
    if (r?.error) { await metaAlert(r.error); return; }
    await metaAlert(avatarTouched ? "저장되었습니다.\n프로필 이미지 저장은 준비 중입니다." : (r?.message ?? "저장되었습니다."));
  });

  /** 원본 #contents 안의 구버전 헤더(스타일시트에서 display:none) — 목록/상세에 따라 좌측 영역만 바뀐다 */
  const contentsHeader = (
    <div className="contents-header">
      <div className="contents-header__wrap">
        <div className="left-area" id="tempLeftHeader" style={view === "profile" ? undefined : { display: "none" }}>
          <span className="material-symbols-sharp">manage_accounts</span>
          <h2>마이페이지</h2>
        </div>
        <div className="left-area contents-header__detail mt-20" id="leftHeaderForDetail" style={view === "password" ? undefined : { display: "none" }}>
          <div className="bread-crumbs"><span>마이페이지</span><span>프로필 설정</span></div>
          <a href="javascript:void(0);" className="back-btn" onClick={(e) => { e.preventDefault(); setView("profile"); }}>
            <img id="rrbackButton" src="/assets/center/images/common/back_header_icon.svg" alt="" />
          </a>
          <h2 id="changetextcontents">비밀번호 변경하기</h2>
        </div>
        <div className="right-area"></div>
      </div>
    </div>
  );

  if (view === "password") {
    return (
      <>
        {contentsHeader}
        <div className="contens-body" id="contapp">
          <PasswordPanel onDone={() => setView("profile")} />
        </div>
      </>
    );
  }

  return (
    <>
    {contentsHeader}
    <div className="contens-body" id="contapp">
      <ul className="list-tab" role="tablist">
        <li className="nav-item" role="presentation">
          <button className="nav-link active" type="button" role="tab" aria-selected="true">프로필 설정</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className="nav-link" type="button" role="tab" aria-selected="false" onClick={() => router.push("/mypage/calculate")}>정산 관리</button>
        </li>
      </ul>
      <div className="tab-content" id="myTabContent">
        <div className="tab-pane fade show active" id="tab-pane-1" role="tabpanel" tabIndex={0}>
          <div className="mypage">
            <div className="mypage__wrap mypage__wrap--1 mt-24">
              <div className="profile__header">
                <div className="profile__image">
                  <label htmlFor="fileInput" id="profileModalButton"><button type="button"><img alt="" src={avatar} /></button></label>
                  <input type="file" id="fileInput" style={{ display: "none" }} accept="image/*" onChange={onAvatar} />
                </div>
                <div className="d-flex items-center justify-content-between gap-3 w-full flex-right">
                  <blockquote><h4>{f.name}</h4></blockquote>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-default button__fill--small" onClick={() => { setAvatar(DEFAULT_AVATAR); setAvatarTouched(false); }}> 기본이미지로 변경</button>
                    <button type="button" className="button__line button__fill--small button__fill--secondary" onClick={save} disabled={pending}>저장하기</button>
                  </div>
                </div>
              </div>
              <div className="profile__body profile__body--oneLine">
                <div className="form-group">
                  <label htmlFor="userName" className="form-label">이름</label>
                  <input type="text" className="form-control" id="userName" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="userID" className="form-label">아이디</label>
                  <input type="tel" className="form-control" id="userID" value={loginId} disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="telchange" className="form-label">전화번호</label>
                  <div className="input-group">
                    <input type="tel" className="form-control" id="telchange" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group">
                    <label htmlFor="passwordChg" className="form-label pr-40 pt-24">비밀번호</label>
                    <button type="button" id="passwordChg" className="btn btn-default" onClick={() => setView("password")}>비밀번호 변경하기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function PasswordPanel({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pending, start] = useTransition();

  const verify = () => start(async () => {
    const r = await verifyCurrentPassword(cur);
    if (r?.error) { await metaAlert(r.error); return; }
    setStep(2);
  });
  const change = () => start(async () => {
    const r = await setNewPassword(pw, confirm);
    if (r?.error) { await metaAlert(r.error); return; }
    await metaAlert("비밀번호가 변경되었습니다.");
    onDone();
  });

  return (
    <div className="mt-20 mypage">
      <div className="mypage__wrap mypage__wrap--1">
        {step === 1 ? (
          <div className="profile__body profile__body--oneLine">
            <h4>비밀번호 변경</h4>
            <div className="form-group">
              <label htmlFor="validationDefault01" className="form-label">현재 비밀번호</label>
              <div className="input-group">
                <input type="password" className="form-control" id="validationDefault01" placeholder="현재 비밀번호를 입력해주세요." required
                  value={cur} onChange={(e) => setCur(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && cur) verify(); }} />
                <button type="button" disabled={!cur || pending} id="buttonForPW" onClick={verify}>변경</button>
                <div id="invfeedb" className="invalid-feedback" style={{ display: "none" }}>비밀번호가 일치하지 않습니다.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile__body profile__body--oneLine">
            <h4>비밀번호 변경</h4>
            <div className="form-group">
              <label htmlFor="validationDefault03" className="form-label">새 비밀번호</label>
              <div className="input-password-hide">
                <input type={show1 ? "text" : "password"} className="form-control" id="validationDefault03" placeholder="새로운 비밀번호를 입력해주세요."
                  value={pw} onChange={(e) => setPw(e.target.value)} />
                <div className="hide-btn" onClick={() => setShow1(!show1)}><span className="material-symbols-sharp">visibility</span></div>
                <div className="invalid-feedback">{"{HELP TEXT}"}</div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="validationDefault04" className="form-label">새 비밀번호 확인</label>
              <div className="input-password-hide">
                <input type={show2 ? "text" : "password"} className="form-control" id="validationDefault04" placeholder="새로운 비밀번호를 입력해주세요."
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && pw && confirm) change(); }} />
                <div className="hide-btn" onClick={() => setShow2(!show2)}><span className="material-symbols-sharp">visibility</span></div>
                <div id="invfeedb02" className="invalid-feedback" style={{ display: pw && confirm && pw !== confirm ? "block" : "none" }}>비밀번호가 일치하지 않습니다.</div>
              </div>
            </div>
            <button id="checkButton" type="button" disabled={!pw || !confirm || pending} className="full-btn" onClick={change}>확인</button>
          </div>
        )}
      </div>
    </div>
  );
}
