import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRD Executive Hub — إدارة التطوير والتأهيل",
  description: "منصة المدير التنفيذي — إدارة التطوير والتأهيل — وزارة البلديات والإسكان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-tajawal">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
