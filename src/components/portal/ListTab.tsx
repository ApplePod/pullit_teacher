"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * 원본 마크업 그대로:
 * <ul class="list-tab" role="tablist"><li class="nav-item">
 *   <button class="nav-link active" type="button" role="tab" onclick="location.href='…'">라벨</button>
 * </li></ul>
 */
export function ListTab({ tabs, className = "" }: { tabs: ReadonlyArray<readonly [string, string]>; className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <ul className={`list-tab ${className}`} role="tablist">
      {tabs.map(([href, label]) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href} className="nav-item">
            <button className={`nav-link${active ? " active" : ""}`} type="button" role="tab" aria-selected={active}
              onClick={() => { if (!active) router.push(href); }}>{label}</button>
          </li>
        );
      })}
    </ul>
  );
}
