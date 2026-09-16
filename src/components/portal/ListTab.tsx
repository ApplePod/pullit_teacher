"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ListTab({ tabs, className = "" }: { tabs: ReadonlyArray<readonly [string, string]>; className?: string }) {
  const pathname = usePathname();
  return (
    <ul className={`list-tab ${className}`} role="tablist">
      {tabs.map(([href, label]) => (
        <li key={href} className="nav-item">
          <Link href={href} className={`nav-link${pathname.startsWith(href) ? " active" : ""}`}>{label}</Link>
        </li>
      ))}
    </ul>
  );
}
