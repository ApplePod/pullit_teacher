export type UserRole = "owner" | "teacher";

export interface Profile {
  id: string;
  center_id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  email: string | null;
  access_menu: Record<string, unknown>;
  is_active: boolean;
  joined_at: string | null;
}

export interface Center {
  id: string;
  name: string;
  owner_name: string | null;
  tel: string | null;
  address: string | null;
  logo_url: string | null;
  slogan: string | null;
  report_style: string | null;
}
