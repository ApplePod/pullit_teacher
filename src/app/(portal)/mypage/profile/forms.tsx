"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

export function ProfileForm({ name, phone, loginId }: { name: string; phone: string; loginId: string }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="profile__body profile__body--oneLine">
      <div className="form-group">
        <label htmlFor="name" className="form-label">이름</label>
        <input id="name" name="name" type="text" className="form-control" defaultValue={name} required />
      </div>
      <div className="form-group">
        <label htmlFor="loginId" className="form-label">아이디</label>
        <input id="loginId" type="text" className="form-control" value={loginId} disabled />
      </div>
      <div className="form-group">
        <label htmlFor="phone" className="form-label">전화번호</label>
        <input id="phone" name="phone" type="tel" className="form-control" defaultValue={phone} placeholder="010-0000-0000" />
      </div>
      <div className="form-group">
        <FormMessage state={state} />
        <SubmitButton className="button__line button__fill--small button__fill--secondary">저장하기</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="profile__body profile__body--oneLine">
      <h4>비밀번호 변경</h4>
      <div className="form-group">
        <label htmlFor="password" className="form-label">새 비밀번호</label>
        <input id="password" name="password" type="password" className="form-control" placeholder="새로운 비밀번호를 입력해주세요." autoComplete="new-password" required minLength={8} />
      </div>
      <div className="form-group">
        <label htmlFor="confirm" className="form-label">새 비밀번호 확인</label>
        <input id="confirm" name="confirm" type="password" className="form-control" placeholder="새로운 비밀번호를 다시 입력해주세요." autoComplete="new-password" required minLength={8} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="full-btn">확인</SubmitButton>
    </form>
  );
}
