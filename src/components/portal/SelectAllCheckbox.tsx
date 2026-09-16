"use client";

import { useState } from "react";

/**
 * 전체선택 체크박스.
 * 원본은 목록이 비어 있어도 체크박스 자체는 켜졌다 꺼졌다 한다(라이브 확인: false→true→false).
 * 행이 있으면 선택 상태를 따르고, 행이 없을 때는 자체 상태로 토글한다.
 */
export function SelectAllCheckbox({
  total, allSelected, onToggle, ...rest
}: { total: number; allSelected: boolean; onToggle: (checked: boolean) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange">) {
  const [emptyOn, setEmptyOn] = useState(false);
  const checked = total > 0 ? allSelected : emptyOn;
  return (
    <input
      {...rest}
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        if (total === 0) setEmptyOn(e.target.checked);
        else setEmptyOn(false);
        onToggle(e.target.checked);
      }}
    />
  );
}
