"use client";

import { useActionState } from "react";
import { updateCenter } from "./actions";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import type { Center } from "@/lib/types";

const FIELDS: Array<[keyof Center, string, boolean, string?]> = [
  ["name", "학원명", true],
  ["owner_name", "대표 선생님명", false],
  ["tel", "전화번호", false, "02-000-0000"],
  ["address", "주소", false],
  ["slogan", "슬로건 (문제지 상단 문구)", false],
];

export function CenterForm({ center, readOnly }: { center: Center; readOnly: boolean }) {
  const [state, action] = useActionState(updateCenter, null);
  return (
    <form action={action} className="templete templete-add">
      <input type="hidden" name="id" value={center.id} />
      <div className="row">
        {FIELDS.map(([key, label, required, ph]) => (
          <div className="col-6" key={key}>
            <div className="form-group">
              <label htmlFor={key} className={`form-label${required ? " required" : ""}`}>{label}</label>
              <input id={key} name={key} type="text" className="form-control" placeholder={ph}
                defaultValue={(center[key] as string | null) ?? ""} disabled={readOnly} required={required} />
            </div>
          </div>
        ))}
      </div>
      <FormMessage state={state} />
      {!readOnly && (
        <div className="d-flex justify-content-end mt-16">
          <SubmitButton className="button__line button__fill--medium button__fill--secondary">저장하기</SubmitButton>
        </div>
      )}
    </form>
  );
}
