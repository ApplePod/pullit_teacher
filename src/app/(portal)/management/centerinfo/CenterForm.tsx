"use client";

import { useActionState } from "react";
import { updateCenter } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Center } from "@/lib/types";

const input = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500";

export function CenterForm({ center, readOnly }: { center: Center; readOnly: boolean }) {
  const [state, action] = useActionState(updateCenter, null);
  const fields: Array<[keyof Center, string, string?]> = [
    ["name", "학원명"],
    ["owner_name", "원장명"],
    ["tel", "대표 전화", "02-000-0000"],
    ["address", "주소"],
    ["slogan", "슬로건", "문제지 상단 문구"],
  ];
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={center.id} />
      {fields.map(([key, label, ph]) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={key}>{label}</label>
          <input id={key} name={key} defaultValue={(center[key] as string | null) ?? ""} placeholder={ph}
            disabled={readOnly} required={key === "name"} className={input} />
        </div>
      ))}
      <FormMessage state={state} />
      {!readOnly && <SubmitButton className="sm:w-auto">저장</SubmitButton>}
    </form>
  );
}
