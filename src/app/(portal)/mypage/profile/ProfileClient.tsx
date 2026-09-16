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

  if (view === "password") {
    return (
      <>
        <div className="contents-header contents-header__detail mt-20">
          <div className="contents-header__wrap">
            <div className="left-area">
              <div className="bread-crumbs"><span>마이페이지</span><span>프로필 설정</span></div>
              <a href="#" className="back-btn" onClick={(e) => { e.preventDefault(); setView("profile"); }}>
                <img id="rrbackButton" src="/assets/center/images/common/back_header_icon.svg" alt="" />
              </a>
              <h2 id="changetextcontents">비밀번호 변경하기</h2>
            </div>
            <div className="right-area"></div>
          </div>
        </div>
        <div className="contens-body">
          <PasswordPanel onDone={() => setView("profile")} />
        </div>
      </>
    );
  }

  return (
    <div className="contens-body">
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
                  <input type="text" className="form-control" id="userID" value={loginId} disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="telchange" className="form-label">전화번호</label>
                  <div className="input-group">
                    <input type="tel" className="form-control" id="telchange" value={f.phone} placeholder="010-0000-0000" onChange={(e) => setF({ ...f, phone: e.target.value })} />
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
  );
}

function PasswordPanel({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
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
    <div className="mypage">
      <div className="mypage__wrap mypage__wrap--1 mt-24">
        <div className="profile__body profile__body--oneLine">
          <h4>비밀번호 변경</h4>
          {step === 1 ? (
            <div className="form-group">
              <label htmlFor="nowPassword" className="form-label">현재 비밀번호</label>
              <div className="input-group gap-1">
                <input type="password" className="form-control" id="nowPassword" placeholder="현재 비밀번호를 입력해주세요."
                  value={cur} onChange={(e) => setCur(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") verify(); }} />
                <button type="button" className="btn btn-default" onClick={verify} disabled={pending}>변경</button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">새 비밀번호</label>
                <input type="password" className="form-control" id="newPassword" placeholder="새 비밀번호를 입력해주세요. (6자 이상)"
                  value={pw} onChange={(e) => setPw(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword2" className="form-label">새 비밀번호 확인</label>
                <div className="input-group gap-1">
                  <input type="password" className="form-control" id="newPassword2" placeholder="새 비밀번호를 다시 입력해주세요."
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") change(); }} />
                  <button type="button" className="btn btn-default" onClick={change} disabled={pending}>변경</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
