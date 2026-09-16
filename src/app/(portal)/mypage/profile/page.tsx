import { requireUser } from "@/lib/auth";
import { displayLoginId } from "@/lib/login-id";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const { user, profile } = await requireUser();
  return <ProfileClient name={profile.name} phone={profile.phone ?? ""} loginId={displayLoginId(user.email)} />;
}
