import { requireUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return <PortalShell userName={profile.name}>{children}</PortalShell>;
}
