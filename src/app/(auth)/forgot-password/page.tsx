"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sendPasswordReset } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(sendPasswordReset, null);
  return (
    <form action={action} className="Form">
      <h2>비밀번호 찾기</h2>
      <div className="flex flex-col w-full gap-xl mb-36">
        <div className={`form-input-basic${state?.error ? " error" : ""}`}>
          <input type="email" name="email" placeholder="가입한 이메일을 입력해주세요." required />
          {state?.error && <p>{state.error}</p>}
          {state?.message && <p style={{ color: "#1e85ff" }}>{state.message}</p>}
        </div>
      </div>
      <div className="btn-wrap">
        <SubmitButton className="btn-primary">재설정 메일 보내기</SubmitButton>
      </div>
      <div className="Links-wrap flex-col">
        <Link href="/login">로그인으로 돌아가기</Link>
      </div>
    </form>
  );
}
