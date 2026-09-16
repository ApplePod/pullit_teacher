import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/management/student", label: "학원관리" },
  { href: "/paper/mypaper", label: "문제지" },
  { href: "/clinic/studentmark", label: "클리닉" },
  { href: "/mypage/profile", label: "마이페이지" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { profile, center } = await requireUser();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="text-xs text-slate-500">풀잇 학원 포털</div>
          <div className="mt-0.5 truncate font-semibold">{center.name}</div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-5 py-4 text-sm">
          <div className="truncate font-medium">{profile.name}</div>
          <div className="text-xs text-slate-500">{profile.role === "owner" ? "원장" : "강사"}</div>
          <form action={logout} className="mt-3">
            <button type="submit" className="text-xs text-slate-500 underline hover:text-slate-900">로그아웃</button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:hidden">
          <span className="font-semibold">{center.name}</span>
          <form action={logout}>
            <button type="submit" className="text-xs text-slate-500 underline">로그아웃</button>
          </form>
        </header>
        <main className="flex-1 px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
