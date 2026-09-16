"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * 원본 마크업 그대로:
 * <ul class="list-tab" role="tablist"><li class="nav-item">
 *   <button class="nav-link active" type="button" role="tab" onclick="location.href='…'">라벨</button>
 * </li></ul>
 */
export function ListTab({ tabs, className = "", linkWrapped = false, tablist = false }: { tabs: ReadonlyArray<readonly [string, string]>; className?: string; linkWrapped?: boolean; tablist?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <ul className={`list-tab ${className}`.trim()} role="tablist">
      {tabs.map(([href, label]) => {
        // 원본: 문항 즐겨찾기 화면도 상단 '즐겨찾기' 탭이 활성
        const active = pathname === href || pathname.startsWith(href + "/") || (href === "/paper/favorite" && pathname === "/paper/favoritequestion");
        // 원본 실측: 채점&클리닉 탭만 role="tab" 을 가지고, aria-selected 는 어느 화면에도 없다
        const btn = (
          <button className={`nav-link${active ? " active" : ""}`} type="button" {...(tablist ? { role: "tab" } : {})}
            onClick={(e) => { e.preventDefault(); if (!active) router.push(href); }}>{label}</button>
        );
        return (
          <li key={href} className="nav-item">
            {/* 원본은 화면에 따라 <a> 로 한 번 감싼다 */}
            {linkWrapped ? <a href={href} onClick={(e) => e.preventDefault()}>{btn}</a> : btn}
          </li>
        );
      })}
    </ul>
  );
}
