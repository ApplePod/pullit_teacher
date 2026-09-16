"use client";
import { useActionState } from "react";
import { updateProfile, changePassword, type ActionState } from "./actions";
export function ProfileForm({ name, phone, loginId }: { name: string; phone: string; loginId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, null);
  return (
    <form action={action} className="profile__body profile__body--oneLine">
      <div className="form-group"><label className="form-label">이름</label><input name="name" className="form-control" defaultValue={name} required /></div>
      <div className="form-group"><label className="form-label">아이디</label><input className="form-control" value={loginId} disabled /></div>
      <div className="form-group"><label className="form-label">전화번호</label><input name="phone" className="form-control" defaultValue={phone} placeholder="010-0000-0000" /></div>
      {state?.error && <p className="form-message form-message--error">{state.error}</p>}
      {state?.message && <p className="form-message form-message--ok">{state.message}</p>}
      <button className="button__line button__fill--small button__fill--secondary" type="submit">저장하기</button>
    </form>
  );
}
export function PasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePassword, null);
  return (
    <form action={action} className="profile__body profile__body--oneLine">
      <h4>비밀번호 변경</h4>
      <div className="form-group"><label className="form-label">새 비밀번호</label><input name="password" type="password" className="form-control" required minLength={6} placeholder="새 비밀번호 (6자 이상)" /></div>
      <div className="form-group"><label className="form-label">새 비밀번호 확인</label><input name="confirm" type="password" className="form-control" required minLength={6} /></div>
      {state?.error && <p className="form-message form-message--error">{state.error}</p>}
      {state?.message && <p className="form-message form-message--ok">{state.message}</p>}
      <button className="full-btn" type="submit">확인</button>
    </form>
  );
}
