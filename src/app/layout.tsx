import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "풀잇 학원 포털",
  description: "풀잇 문항으로 문제지를 만들고 학원을 관리하는 포털",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
