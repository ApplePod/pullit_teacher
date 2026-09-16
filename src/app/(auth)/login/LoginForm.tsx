"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>로그인</SubmitButton>
    </form>
  );
}
