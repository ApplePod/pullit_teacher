"use client";

import { metaAlert, metaConfirm } from "@/components/portal/MetaModal";

import { OriginalModal, BTN_CANCEL, BTN_APPLY, BTN_WHITE_XS, BTN_RED_MD } from "@/components/portal/OriginalModal";

import { useEffect, useState, useTransition } from "react";
import { listAssignableStudents, assignPaper } from "../../clinic/clinicActions";

export function AssignButton({ paperId }: { paperId: string }) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string; grade: string }[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (open) start(async () => setStudents(await listAssignableStudents())); }, [open]);
  const toggle = (id: string) => setSel((c) => { const n = new Set(c); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const submit = () => {
    setMsg(null);
    start(async () => {
      const r = await assignPaper(paperId, [...sel]);
      if (r.error) setMsg(r.error);
      else { setOpen(false); setSel(new Set()); metaAlert("배정 완료. 채점&클리닉 › 학생별 채점에서 채점하세요."); }
    });
  };
  return (
    <>
      <button className={BTN_RED_MD} onClick={() => setOpen(true)}>학생 배정</button>
      {open && (
        <OriginalModal id="pt-modal" title={<>학생 배정</>} onClose={() => setOpen(false)} footer={<><button className={BTN_WHITE_XS + " button__weight--medium"} onClick={() => setOpen(false)}>취소</button>
              <button className={BTN_APPLY} onClick={submit} disabled={pending || sel.size === 0}>배정하기</button></>}>
        <div>
              <p className="mark-summary">배정할 학생을 선택하세요. 선택 <b>{sel.size}</b>명</p>
              <div className="assign-list">
                {students.map((s) => (
                  <label key={s.id} className="assign-item">
                    <input type="checkbox" checked={sel.has(s.id)} onChange={() => toggle(s.id)} /> {s.name}
                  </label>
                ))}
                {students.length === 0 && <p className="make-empty">{pending ? "불러오는 중…" : "등록된 학생이 없습니다."}</p>}
              </div>
              {msg && <p className="form-message form-message--error">{msg}</p>}
            </div>
      </OriginalModal>
    )}
    </>
  );
}
