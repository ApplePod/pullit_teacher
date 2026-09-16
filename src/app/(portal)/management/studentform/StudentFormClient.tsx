"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STUDENT_FORM_HTML } from "./studentFormHtml";
import { createStudent, updateStudent, type StudentRow } from "../student/studentActions";
import { GRADE_BY_LABEL, GRADE_LABEL } from "@/lib/mgmt-consts";

/** 원본 학생 등록/수정 화면(studentForm.cshtml) 마크업 그대로 + 저장 동작 연결 */
export function StudentFormClient({ student }: { student: StudentRow | null }) {
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const saveRef = useRef<() => void>(() => {});

  // 수정 모드: 원본 필드에 값 채우기
  useEffect(() => {
    const r = host.current; if (!r) return;
    const set = (id: string, v: string) => { const el = r.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("#" + id); if (el) el.value = v; };
    if (student) {
      set("stdName", student.name); set("stdHp", student.phone ?? ""); set("parentNm", student.parent_name ?? ""); set("parentHp", student.parent_phone ?? "");
      const sel = r.querySelector<HTMLSelectElement>("#sltGrade");
      if (sel) { const label = GRADE_LABEL[student.grade] ?? ""; [...sel.options].forEach((o) => { if (o.text.trim() === label) sel.value = o.value; }); }
      const lv = (student.study_level ?? "").replace("L", ""); const lvEl = r.querySelector<HTMLInputElement>(`#userLv_SL0${lv}`); if (lvEl) lvEl.checked = true;
      const st = r.querySelector<HTMLInputElement>(student.state === "paused" ? "#userStatus_MS01" : "#userStatus_MS10"); if (st) st.checked = true;
      r.querySelector<HTMLButtonElement>('button[onclick*="수정"], .btn-submit')?.setAttribute("data-mode", "edit");
    } else {
      const st = r.querySelector<HTMLInputElement>("#userStatus_MS10"); if (st) st.checked = true; // 기본: 정규학생
    }
    // 원본의 '저장하기/수정하기'(done 아이콘) · '목록으로' 버튼 동작 연결
    const onClick = (e: Event) => {
      const t = e.target as HTMLElement; const btn = t.closest("button"); if (!btn) return;
      const txt = (btn.textContent || "").replace(/\s+/g, " ").trim();
      if (/목록으로/.test(txt)) { e.preventDefault(); router.push("/management/student"); return; }
      if (/저장하기|수정하기|done/.test(txt) || btn.querySelector(".material-symbols-sharp")?.textContent?.trim() === "done") { e.preventDefault(); saveRef.current(); return; }
      if (/우편번호 검색|중복체크|추가/.test(txt)) { e.preventDefault(); setMsg(`'${txt}' 기능은 준비 중입니다.`); }
    };
    r.addEventListener("click", onClick); return () => r.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  saveRef.current = () => save();
  const val = (id: string) => (host.current?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("#" + id)?.value ?? "").trim();
  const save = () => {
    setMsg(null);
    const r = host.current!; const name = val("stdName");
    if (!name) { setMsg("학생명을 입력해주세요."); return; }
    const gradeSel = r.querySelector<HTMLSelectElement>("#sltGrade"); const gradeLabel = gradeSel ? gradeSel.options[gradeSel.selectedIndex]?.text.trim() : "";
    const grade = GRADE_BY_LABEL[gradeLabel] ?? "h3";
    const lv = r.querySelector<HTMLInputElement>('input[name="userLv"]:checked')?.id.replace("userLv_SL0", "L") ?? undefined;
    const stateEl = r.querySelector<HTMLInputElement>('input[name="userStatus"]:checked'); const state = stateEl?.id === "userStatus_MS01" ? "paused" : "active";
    const address = [val("f_zip_cd"), val("f_address_1"), val("f_address_2")].filter(Boolean).join(" ");
    const payload = { name, grade, phone: val("stdHp"), parent_name: val("parentNm"), parent_phone: val("parentHp"), address, memo: val("floatingTextarea2") };
    start(async () => {
      const res = student
        ? await updateStudent(student.id, { ...payload, study_level: lv, state } as never)
        : await createStudent({ ...payload, study_level: lv, state } as never);
      if (res.error) setMsg(res.error); else router.push("/management/student");
    });
  };

  return (
    <div ref={host} className="studentform-host">
      {msg && <p className="form-message form-message--error" style={{ margin: "8px 0" }}>{msg}</p>}
      <div className="contens-body" dangerouslySetInnerHTML={{ __html: STUDENT_FORM_HTML }} />
      {pending && <p className="sample-guide">저장 중…</p>}
    </div>
  );
}
