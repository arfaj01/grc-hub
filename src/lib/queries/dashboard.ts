import { createClient } from "@/lib/supabase/server";
import type { Goal, Initiative, Achievement } from "@/types/database";

export type DashboardData = {
  // Goals
  goals: Goal[];
  goalsTotal: number;
  goalsCompleted: number;
  goalsOnTrack: number;
  goalsDelayed: number;
  goalsAvgProgress: number;

  // Achievements
  achievements: Achievement[];
  achievementsTotal: number;
  achievementsThisMonth: number;
  achievementsMonthlyReportable: number;
  achievementsQuarterlyReportable: number;
  achievementsAnnualReportable: number;
  achievementsHighlighted: number;
  recentAchievements: Achievement[];

  // Initiatives
  initiatives: Initiative[];
  initiativesTotal: number;
  initiativesByStatus: Record<string, number>;
  initiativesAvgProgress: number;

  // Data quality alerts
  alerts: DataAlert[];

  // Reporting readiness
  reportReady: number;
  reportMissing: number;

  // Current month label
  currentMonthLabel: string;
};

export type DataAlert = {
  type: "warning" | "info";
  message: string;
  count: number;
};

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [
    { data: goals },
    { data: achievements },
    { data: initiatives },
  ] = await Promise.all([
    supabase.from("goals").select("*").order("sort_order"),
    supabase.from("achievements").select("*").order("achievement_date", { ascending: false }),
    supabase.from("development_initiatives").select("*").order("sort_order"),
  ]);

  const g = goals ?? [];
  const a = achievements ?? [];
  const i = initiatives ?? [];

  // Current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const currentMonthLabel = `${MONTHS_AR[now.getMonth()]} ${now.getFullYear()}`;

  // Goals aggregation
  const goalsCompleted = g.filter((x) => x.status === "مكتمل").length;
  const goalsOnTrack = g.filter((x) => x.status === "نشط").length;
  const goalsDelayed = g.filter((x) => x.status === "متأخر").length;
  const goalsAvgProgress = g.length > 0
    ? Math.round(g.reduce((sum, x) => sum + x.progress_percentage, 0) / g.length)
    : 0;

  // Achievements aggregation
  const thisMonthAchievements = a.filter(
    (x) => x.achievement_date >= monthStart && x.achievement_date <= monthEnd
  );
  const monthlyReportable = a.filter((x) => x.is_monthly_reportable);
  const quarterlyReportable = a.filter((x) => x.is_quarterly_reportable);
  const annualReportable = a.filter((x) => x.is_annual_reportable);
  const highlighted = a.filter((x) => x.is_highlight);

  // Initiatives by status
  const initiativesByStatus: Record<string, number> = {};
  for (const init of i) {
    initiativesByStatus[init.status] = (initiativesByStatus[init.status] || 0) + 1;
  }
  const initiativesAvgProgress = i.length > 0
    ? Math.round(i.reduce((sum, x) => sum + x.progress_percentage, 0) / i.length)
    : 0;

  // Reporting readiness: monthly reportable achievements for current month
  const thisMonthReportable = thisMonthAchievements.filter((x) => x.is_monthly_reportable);
  const thisMonthNotReportable = thisMonthAchievements.filter((x) => !x.is_monthly_reportable);

  // Data quality alerts
  const alerts: DataAlert[] = [];

  const unlinkedAchievements = a.filter((x) => !x.goal_id);
  if (unlinkedAchievements.length > 0) {
    alerts.push({
      type: "warning",
      message: "منجزات غير مرتبطة بأهداف",
      count: unlinkedAchievements.length,
    });
  }

  const draftAchievements = a.filter((x) => x.status === "مسودة");
  if (draftAchievements.length > 0) {
    alerts.push({
      type: "info",
      message: "منجزات في حالة مسودة",
      count: draftAchievements.length,
    });
  }

  const noReportFlags = a.filter(
    (x) => !x.is_monthly_reportable && !x.is_quarterly_reportable && !x.is_annual_reportable
  );
  if (noReportFlags.length > 0) {
    alerts.push({
      type: "warning",
      message: "منجزات بدون تصنيف تقارير",
      count: noReportFlags.length,
    });
  }

  const stoppedInitiatives = i.filter((x) => x.status === "متوقف");
  if (stoppedInitiatives.length > 0) {
    alerts.push({
      type: "warning",
      message: "مبادرات متوقفة",
      count: stoppedInitiatives.length,
    });
  }

  return {
    goals: g,
    goalsTotal: g.length,
    goalsCompleted,
    goalsOnTrack,
    goalsDelayed,
    goalsAvgProgress,

    achievements: a,
    achievementsTotal: a.length,
    achievementsThisMonth: thisMonthAchievements.length,
    achievementsMonthlyReportable: monthlyReportable.length,
    achievementsQuarterlyReportable: quarterlyReportable.length,
    achievementsAnnualReportable: annualReportable.length,
    achievementsHighlighted: highlighted.length,
    recentAchievements: a.slice(0, 5),

    initiatives: i,
    initiativesTotal: i.length,
    initiativesByStatus,
    initiativesAvgProgress,

    alerts,

    reportReady: thisMonthReportable.length,
    reportMissing: thisMonthNotReportable.length,

    currentMonthLabel,
  };
}
