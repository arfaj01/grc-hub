import { FileCheck, Calendar, BarChart3, Trophy } from "lucide-react";

interface Props {
  achievementsMonthlyReportable: number;
  achievementsQuarterlyReportable: number;
  achievementsAnnualReportable: number;
  achievementsHighlighted: number;
}

export function AchievementsInsights({
  achievementsMonthlyReportable,
  achievementsQuarterlyReportable,
  achievementsAnnualReportable,
  achievementsHighlighted,
}: Props) {
  const items = [
    { label: "التقرير الشهري", count: achievementsMonthlyReportable, icon: Calendar, color: "#038A85" },
    { label: "التقرير الربعي", count: achievementsQuarterlyReportable, icon: BarChart3, color: "#1A5276" },
    { label: "التقرير السنوي", count: achievementsAnnualReportable, icon: FileCheck, color: "#A8872C" },
    { label: "منجزات مميزة", count: achievementsHighlighted, icon: Trophy, color: "#86B940" },
  ];

  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b">
        <h3 className="font-bold text-gray-900 text-sm">جاهزية التقارير</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900">{item.count}</p>
                <p className="text-[11px] text-gray-500 truncate">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
