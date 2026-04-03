import { Star } from "lucide-react";
import type { Achievement } from "@/types/database";
import { CATEGORY_COLORS } from "@/lib/constants/brand";

export function RecentAchievements({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-xs">لم تتم إضافة منجزات بعد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b">
        <h3 className="font-bold text-gray-900 text-sm">آخر المنجزات</h3>
      </div>
      <div className="divide-y">
        {achievements.map((a) => (
          <div key={a.id} className="px-5 py-3 flex items-start gap-3">
            <div
              className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: CATEGORY_COLORS[a.category] || "#999" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">{a.title}</p>
                {a.is_highlight && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400">
                  {new Date(a.achievement_date).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
                </span>
                <span style={{ color: CATEGORY_COLORS[a.category] }}>{a.category}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">{a.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
