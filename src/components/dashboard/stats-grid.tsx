import { Target, Layers, Award, Star, TrendingUp, FileCheck } from "lucide-react";
import { progressColor } from "@/lib/constants/brand";

interface Props {
  goalsTotal: number;
  goalsAvgProgress: number;
  achievementsTotal: number;
  achievementsThisMonth: number;
  initiativesTotal: number;
  initiativesAvgProgress: number;
  achievementsHighlighted: number;
  reportReady: number;
  currentMonthLabel: string;
}

export function StatsGrid({
  goalsTotal, goalsAvgProgress,
  achievementsTotal, achievementsThisMonth,
  initiativesTotal, initiativesAvgProgress,
  achievementsHighlighted,
  reportReady, currentMonthLabel,
}: Props) {
  const cards = [
    {
      label: "الأهداف الاستراتيجية",
      value: goalsTotal,
      sub: `متوسط التقدم ${goalsAvgProgress}%`,
      icon: Target,
      accent: "#1A5276",
      bg: "bg-blue-50",
    },
    {
      label: "إجمالي المنجزات",
      value: achievementsTotal,
      sub: `${achievementsThisMonth} هذا الشهر`,
      icon: Award,
      accent: "#A8872C",
      bg: "bg-amber-50",
    },
    {
      label: "مبادرات التطوير",
      value: initiativesTotal,
      sub: `متوسط الإنجاز ${initiativesAvgProgress}%`,
      icon: Layers,
      accent: "#026D69",
      bg: "bg-teal-50",
    },
    {
      label: "منجزات مميزة",
      value: achievementsHighlighted,
      sub: "مرشحة للإبراز",
      icon: Star,
      accent: "#86B940",
      bg: "bg-lime-50",
    },
    {
      label: `جاهز للتقرير الشهري`,
      value: reportReady,
      sub: currentMonthLabel,
      icon: FileCheck,
      accent: "#038A85",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border p-4 group hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
              <c.icon className="w-4.5 h-4.5" style={{ color: c.accent }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          <p className="text-xs font-medium text-gray-600 mt-0.5">{c.label}</p>
          <p className="text-[11px] text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
