"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action] = useActionState(login, null);
  const [id, setId] = useState("");
  return (
    <form action={action} className="Form">
      <h2>학원 포털 로그인</h2>
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col w-full gap-xl mb-36">
        <div className={`form-input-basic${state?.error ? " error" : ""}`}>
          <input type="text" name="email" placeholder="아이디를 입력해주세요." maxLength={64}
            autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <div className={`form-input-basic${state?.error ? " error" : ""}`}>
          <input className="input-basic-2" type="password" name="password" placeholder="비밀번호를 입력해주세요."
            maxLength={64} autoComplete="current-password" required />
          {state?.error && <p>{state.error}</p>}
          {notice && <p>{notice}</p>}
        </div>
      </div>
      <div className="Checkbox-wrap">
        <div />
        <div>
          <Link href="/forgot-password">아이디/비밀번호 찾기</Link>
        </div>
      </div>
      <div className="btn-wrap">
        <SubmitButton className={id ? "btn-primary" : "btn-success"}>로그인</SubmitButton>
      </div>
    </form>
  );
}
