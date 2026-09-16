"use client";

import { useActionState } from "react";
import { updatePassword } from "../actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-slate-600">새 비밀번호를 입력해주세요. (8자 이상)</p>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">새 비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700">비밀번호 확인</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>비밀번호 변경</SubmitButton>
    </form>
  );
}
