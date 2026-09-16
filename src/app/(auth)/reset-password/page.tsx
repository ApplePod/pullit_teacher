"use client";

import { useActionState } from "react";
import { updatePassword } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="Form">
      <h2>새 비밀번호 설정</h2>
      <div className="flex flex-col w-full gap-xl mb-36">
        <div className="form-input-basic">
          <input type="password" name="password" placeholder="새 비밀번호 (8자 이상)" autoComplete="new-password" required minLength={8} />
        </div>
        <div className={`form-input-basic${state?.error ? " error" : ""}`}>
          <input className="input-basic-2" type="password" name="confirm" placeholder="새 비밀번호 확인" autoComplete="new-password" required minLength={8} />
          {state?.error && <p>{state.error}</p>}
        </div>
      </div>
      <div className="btn-wrap">
        <SubmitButton className="btn-primary">비밀번호 변경</SubmitButton>
      </div>
    </form>
  );
}
