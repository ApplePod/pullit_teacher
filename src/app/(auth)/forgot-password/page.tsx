"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sendPasswordReset } from "../actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(sendPasswordReset, null);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-slate-600">가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
        <input id="email" name="email" type="email" required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>재설정 메일 보내기</SubmitButton>
      <div className="text-center text-sm">
        <Link href="/login" className="text-slate-500 hover:text-slate-900">로그인으로 돌아가기</Link>
      </div>
    </form>
  );
}
