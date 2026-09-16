"use client";
import { useActionState } from "react";
import { updateCenter, type ActionState } from "./actions";
import type { Center } from "@/lib/types";
const F: [keyof Center, string, boolean, string?][] = [["name","교실명",true],["owner_name","대표 선생님명",false],["tel","전화번호",false,"02-000-0000"],["address","주소",false],["slogan","슬로건",false,"문제지 상단 문구"]];
export function CenterForm({ center, readOnly }: { center: Center; readOnly: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(updateCenter, null);
  return (
    <form action={action} className="templete templete-add">
      <div className="row">
        {F.map(([k, l, req, ph]) => (
          <div className="col-6" key={k}>
            <div className="form-group">
              <label className={`form-label${req ? " required" : ""}`}>{l}</label>
              <input name={k} className="form-control" defaultValue={(center[k] as string | null) ?? ""} placeholder={ph} disabled={readOnly} required={req} />
            </div>
          </div>
        ))}
      </div>
      {state?.error && <p className="form-message form-message--error">{state.error}</p>}
      {state?.message && <p className="form-message form-message--ok">{state.message}</p>}
      {!readOnly && <div className="d-flex justify-content-end mt-16"><button className="button__line button__fill--medium button__fill--secondary" type="submit">저장하기</button></div>}
    </form>
  );
}
