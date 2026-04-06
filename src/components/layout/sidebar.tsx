"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Target, Layers, Award, FileText,
  Archive, StickyNote, Settings, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "لوحة المعلومات", icon: LayoutDashboard },
  { href: "/goals", label: "الأهداف", icon: Target },
  { href: "/initiatives", label: "خطة التطوير", icon: Layers },
  { href: "/achievements", label: "المنجزات", icon: Award },
  { href: "/reports", label: "التقارير", icon: FileText },
  { href: "/archive", label: "الأرشيف", icon: Archive },
  { href: "/notes", label: "الملاحظات", icon: StickyNote },
  { href: "/import", label: "استيراد البيانات", icon: Upload },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-teal-deep text-white flex flex-col no-print shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="text-brand-lime font-bold text-lg">D</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">DRD Executive Hub</h1>
            <p className="text-[11px] text-white/50 leading-tight">إدارة التطوير والتأهيل</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">وزارة البلديات والإسكان</p>
      </div>
    </aside>
  );
}
