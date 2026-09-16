"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function PortalShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div id="wrap">
      <Sidebar userName={userName} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <article id="contents" className={`include-left${collapsed ? "" : " expanded"}`}>
        {children}
      </article>
    </div>
  );
}
