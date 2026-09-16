import { TopNav } from "./TopNav";
import { MetaModalHost } from "./MetaModal";

export function PortalShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  return (
    <div id="wrap">
      <TopNav userName={userName} />
      <article id="contents">{children}</article>
      <MetaModalHost />
    </div>
  );
}
