"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Header({ user }: { user: User }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 no-print shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">{user.email}</span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
