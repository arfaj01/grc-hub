import { createClient } from "@/lib/supabase/server";
import type { Goal, Initiative, Achievement, Note, ReportPeriod, Report } from "@/types/database";

/* ═══════════════════════════════════════════════════════════════
   Arabic month names
   ═══════════════════════════════════════════════════════════════ */
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const QUARTER_AR: Record<number, string> = {
  1: "الربع الأول",
  2: "الربع الثاني",
  3: "الربع الثالث",
  4: "الربع الرابع",
};

/* ═══════════════════════════════════════════════════════════════
   Types for the report snapshot — the structured data that gets
   frozen into reports.generated_snapshot at generation time.
   ═══════════════════════════════════════════════════════════════ */

export type GoalSnapshot = Pick<
  Goal,
  "id" | "code" | "title" | "progress_percentage" | "status" | "target_value" | "current_value" | "baseline_value" | "success_metric_label" | "executive_comment"
>;

export type InitiativeSnapshot = Pick<
  Initiative,
  "id" | "title" | "pillar" | "status" | "progress_percentage" | "goal_id" | "impact_statement" | "notes"
>;

export type AchievementSnapshot = Pick<
  Achievement,
  "id" | "title" | "achievement_date" | "category" | "summary" | "impact" | "status" | "goal_id" | "initiative_id" | "is_highlight"
>;

export type NoteSnapshot = Pick<
  Note,
  "id" | "title" | "body" | "note_type" | "note_date" | "goal_id" | "initiative_id"
>;

export type ReportSnapshot = {
  generatedAt: string;
  periodLabel: string;
  periodType: "monthly" | "quarterly" | "annual";
  year: number;
  month?: number;
  quarter?: number;
  startDate: string;
  endDate: string;

  // Goals at this point in time
  goals: GoalSnapshot[];
  goalsAvgProgress: number;

  // Initiatives at this point in time
  initiatives: InitiativeSnapshot[];
  initiativesAvgProgress: number;
  initiativesByStatus: Record<string, number>;

  // Achievements within the period
  achievements: AchievementSnapshot[];
  achievementsByGoal: Record<string, AchievementSnapshot[]>; // goal_id → achievements
  achievementsByCategory: Record<string, AchievementSnapshot[]>;
  highlights: AchievementSnapshot[];
  totalAchievements: number;

  // Notes within the period
  notes: NoteSnapshot[];
  challenges: NoteSnapshot[];  // note_type = "تحدي"
  opportunities: NoteSnapshot[]; // note_type = "فرصة"
  decisions: NoteSnapshot[]; // note_type = "مستقبلي"

  // Quarterly-specific: per-month breakdown
  monthlyBreakdown?: {
    month: number;
    label: string;
    achievementCount: number;
    achievements: AchievementSnapshot[];
  }[];

  // Annual-specific: per-quarter breakdown
  quarterlyBreakdown?: {
    quarter: number;
    label: string;
    achievementCount: number;
    achievements: AchievementSnapshot[];
  }[];
};

/* ═══════════════════════════════════════════════════════════════
   Period helpers
   ═══════════════════════════════════════════════════════════════ */

export function getMonthlyPeriod(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
    label: `${MONTHS_AR[month - 1]} ${year}`,
  };
}

export function getQuarterlyPeriod(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
    label: `${QUARTER_AR[quarter]} — ${year}`,
  };
}

export function getAnnualPeriod(year: number) {
  return {
    start_date: `${year}-01-01`,
    end_date: `${year}-12-31`,
    label: `التقرير السنوي ${year}`,
  };
}

/* ═══════════════════════════════════════════════════════════════
   Core aggregation: fetch all data for a period and compute
   the full structured snapshot.
   ═══════════════════════════════════════════════════════════════ */

export async function buildReportSnapshot(
  periodType: "monthly" | "quarterly" | "annual",
  startDate: string,
  endDate: string,
  periodLabel: string,
  year: number,
  month?: number,
  quarter?: number,
): Promise<ReportSnapshot> {
  const supabase = await createClient();

  // Determine the reportability flag to filter achievements
  const reportableFlag =
    periodType === "monthly" ? "is_monthly_reportable" :
    periodType === "quarterly" ? "is_quarterly_reportable" :
    "is_annual_reportable";

  // Fetch all data in parallel
  const [
    { data: goals },
    { data: allAchievements },
    { data: initiatives },
    { data: notes },
  ] = await Promise.all([
    supabase.from("goals").select("id, code, title, progress_percentage, status, target_value, current_value, baseline_value, success_metric_label, executive_comment").order("sort_order"),
    supabase.from("achievements")
      .select("id, title, achievement_date, category, summary, impact, status, goal_id, initiative_id, is_highlight, is_monthly_reportable, is_quarterly_reportable, is_annual_reportable")
      .gte("achievement_date", startDate)
      .lte("achievement_date", endDate)
      .eq(reportableFlag, true)
      .order("achievement_date", { ascending: false }),
    supabase.from("development_initiatives").select("id, title, pillar, status, progress_percentage, goal_id, impact_statement, notes").order("sort_order"),
    supabase.from("notes")
      .select("id, title, body, note_type, note_date, goal_id, initiative_id")
      .gte("note_date", startDate)
      .lte("note_date", endDate)
      .order("note_date", { ascending: false }),
  ]);

  const g = (goals ?? []) as GoalSnapshot[];
  const a = (allAchievements ?? []) as AchievementSnapshot[];
  const i = (initiatives ?? []) as InitiativeSnapshot[];
  const n = (notes ?? []) as NoteSnapshot[];

  // Goals average progress
  const goalsAvgProgress = g.length > 0
    ? Math.round(g.reduce((sum, x) => sum + x.progress_percentage, 0) / g.length)
    : 0;

  // Initiatives aggregation
  const initiativesAvgProgress = i.length > 0
    ? Math.round(i.reduce((sum, x) => sum + x.progress_percentage, 0) / i.length)
    : 0;
  const initiativesByStatus: Record<string, number> = {};
  for (const init of i) {
    initiativesByStatus[init.status] = (initiativesByStatus[init.status] || 0) + 1;
  }

  // Achievements grouped by goal
  const achievementsByGoal: Record<string, AchievementSnapshot[]> = {};
  for (const ach of a) {
    const key = ach.goal_id || "__unlinked__";
    if (!achievementsByGoal[key]) achievementsByGoal[key] = [];
    achievementsByGoal[key].push(ach);
  }

  // Achievements grouped by category
  const achievementsByCategory: Record<string, AchievementSnapshot[]> = {};
  for (const ach of a) {
    if (!achievementsByCategory[ach.category]) achievementsByCategory[ach.category] = [];
    achievementsByCategory[ach.category].push(ach);
  }

  // Highlights
  const highlights = a.filter((x) => x.is_highlight);

  // Notes by type
  const challenges = n.filter((x) => x.note_type === "تحدي");
  const opportunities = n.filter((x) => x.note_type === "فرصة");
  const decisions = n.filter((x) => x.note_type === "مستقبلي");

  const snapshot: ReportSnapshot = {
    generatedAt: new Date().toISOString(),
    periodLabel,
    periodType,
    year,
    month,
    quarter,
    startDate,
    endDate,
    goals: g,
    goalsAvgProgress,
    initiatives: i,
    initiativesAvgProgress,
    initiativesByStatus,
    achievements: a,
    achievementsByGoal,
    achievementsByCategory,
    highlights,
    totalAchievements: a.length,
    notes: n,
    challenges,
    opportunities,
    decisions,
  };

  // Quarterly: per-month breakdown
  if (periodType === "quarterly" && quarter) {
    const startMonth = (quarter - 1) * 3 + 1;
    snapshot.monthlyBreakdown = [0, 1, 2].map((offset) => {
      const m = startMonth + offset;
      const mStart = `${year}-${String(m).padStart(2, "0")}-01`;
      const mEnd = new Date(year, m, 0).toISOString().split("T")[0];
      const monthAch = a.filter((x) => x.achievement_date >= mStart && x.achievement_date <= mEnd);
      return {
        month: m,
        label: MONTHS_AR[m - 1],
        achievementCount: monthAch.length,
        achievements: monthAch,
      };
    });
  }

  // Annual: per-quarter breakdown
  if (periodType === "annual") {
    snapshot.quarterlyBreakdown = [1, 2, 3, 4].map((q) => {
      const qStart = `${year}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`;
      const qEnd = new Date(year, q * 3, 0).toISOString().split("T")[0];
      const qAch = a.filter((x) => x.achievement_date >= qStart && x.achievement_date <= qEnd);
      return {
        quarter: q,
        label: QUARTER_AR[q],
        achievementCount: qAch.length,
        achievements: qAch,
      };
    });
  }

  return snapshot;
}

/* ═══════════════════════════════════════════════════════════════
   Fetch reports list with their period info
   ═══════════════════════════════════════════════════════════════ */

export type ReportWithPeriod = Report & { period: ReportPeriod | null };

export async function fetchReports(): Promise<ReportWithPeriod[]> {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, period:report_periods(*)")
    .order("created_at", { ascending: false });

  return (reports ?? []) as ReportWithPeriod[];
}

/* ═══════════════════════════════════════════════════════════════
   Fetch single report with sections and period
   ═══════════════════════════════════════════════════════════════ */

export async function fetchReport(id: string) {
  const supabase = await createClient();

  const [{ data: report }, { data: sections }] = await Promise.all([
    supabase.from("reports").select("*, period:report_periods(*)").eq("id", id).single(),
    supabase.from("report_sections").select("*").eq("report_id", id).order("sort_order"),
  ]);

  return {
    report: report as ReportWithPeriod | null,
    sections: sections ?? [],
  };
}

/* ═══════════════════════════════════════════════════════════════
   Fetch existing report periods
   ═══════════════════════════════════════════════════════════════ */

export async function fetchReportPeriods(): Promise<ReportPeriod[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("report_periods")
    .select("*")
    .order("start_date", { ascending: false });
  return data ?? [];
}

/* ═══════════════════════════════════════════════════════════════
   Auto-generate default title for a report
   ═══════════════════════════════════════════════════════════════ */

export function generateReportTitle(
  periodType: "monthly" | "quarterly" | "annual",
  periodLabel: string,
): string {
  const typeLabel =
    periodType === "monthly" ? "التقرير الشهري" :
    periodType === "quarterly" ? "التقرير الربع سنوي" :
    "التقرير السنوي";
  return `${typeLabel} — ${periodLabel}`;
}

/* ═══════════════════════════════════════════════════════════════
   Fetch goals + initiatives for linking in report creation
   ═══════════════════════════════════════════════════════════════ */

export async function fetchReportFormData() {
  const supabase = await createClient();
  const [{ data: goals }, { data: initiatives }] = await Promise.all([
    supabase.from("goals").select("id, code, title").order("sort_order"),
    supabase.from("development_initiatives").select("id, title").order("sort_order"),
  ]);
  return {
    goals: goals ?? [],
    initiatives: initiatives ?? [],
  };
}
