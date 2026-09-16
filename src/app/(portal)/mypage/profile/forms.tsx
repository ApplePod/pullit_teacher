"use client";

import { useActionState } from "react";
import { updateProfile, changePassword } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";

const input = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">이름</label>
        <input id="name" name="name" defaultValue={name} required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">휴대폰</label>
        <input id="phone" name="phone" defaultValue={phone} placeholder="010-0000-0000" className={input} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="sm:w-auto">저장</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">새 비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirm">비밀번호 확인</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} className={input} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="sm:w-auto">비밀번호 변경</SubmitButton>
    </form>
  );
}
