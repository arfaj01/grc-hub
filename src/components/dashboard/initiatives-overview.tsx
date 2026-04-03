import { STATUS_COLORS, progressColor } from "@/lib/constants/brand";

interface Props {
  initiativesByStatus: Record<string, number>;
  initiativesAvgProgress: number;
  initiativesTotal: number;
}

// Status display order
const STATUS_ORDER = ["جاري", "مكتمل", "جاري الطرح", "في التصميم", "دراسة أولية", "طور الترسية", "لم يبدأ", "متوقف"];

export function InitiativesOverview({ initiativesByStatus, initiativesAvgProgress, initiativesTotal }: Props) {
  // Filter to only statuses that have counts
  const activeStatuses = STATUS_ORDER.filter((s) => (initiativesByStatus[s] || 0) > 0);

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">حالة المبادرات</h3>
        <span className="text-xs font-bold" style={{ color: progressColor(initiativesAvgProgress) }}>
          {initiativesAvgProgress}% متوسط
        </span>
      </div>
      <div className="p-5">
        {/* Stacked bar */}
        {initiativesTotal > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            {activeStatuses.map((status) => {
              const count = initiativesByStatus[status] || 0;
              const pct = (count / initiativesTotal) * 100;
              return (
                <div
                  key={status}
                  className="transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: STATUS_COLORS[status] || "#95a5a6",
                  }}
                  title={`${status}: ${count}`}
                />
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {activeStatuses.map((status) => (
            <div key={status} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[status] || "#95a5a6" }}
                />
                <span className="text-xs text-gray-600">{status}</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{initiativesByStatus[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
