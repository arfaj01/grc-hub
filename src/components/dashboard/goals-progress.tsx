import type { Goal } from "@/types/database";
import { progressColor } from "@/lib/constants/brand";

interface Props {
  goals: Goal[];
  goalsCompleted: number;
  goalsOnTrack: number;
  goalsDelayed: number;
  goalsAvgProgress: number;
}

export function GoalsProgress({ goals, goalsCompleted, goalsOnTrack, goalsDelayed, goalsAvgProgress }: Props) {
  const statusBreakdown = [
    { label: "مكتمل", count: goalsCompleted, color: "#86B940" },
    { label: "على المسار", count: goalsOnTrack, color: "#038A85" },
    { label: "متعثر", count: goalsDelayed, color: "#c0392b" },
  ];

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">تقدم الأهداف</h3>
        <span className="text-xs font-bold" style={{ color: progressColor(goalsAvgProgress) }}>
          {goalsAvgProgress}% متوسط
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Status breakdown chips */}
        <div className="flex gap-4">
          {statusBreakdown.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-gray-600">{s.label}</span>
              <span className="text-xs font-bold text-gray-900">{s.count}</span>
            </div>
          ))}
        </div>

        {/* Individual goal bars */}
        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: g.color || "#026D69" }}
                  >
                    {g.code}
                  </span>
                  <span className="text-xs text-gray-700 truncate max-w-[200px]">{g.title}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: progressColor(g.progress_percentage) }}>
                  {g.progress_percentage}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(g.progress_percentage, 100)}%`,
                    backgroundColor: progressColor(g.progress_percentage),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
