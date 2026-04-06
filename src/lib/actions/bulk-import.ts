"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────

export type BulkAchievementRow = {
  title: string;
  achievement_date: string;
  category: "استراتيجي" | "تنفيذي";
  description?: string;
  impact?: string;
  status?: "مسودة" | "معتمد" | "مميز";
  goal_code?: string; // e.g. "g1", "g2"
  is_highlight?: boolean;
};

export type BulkInitiativeRow = {
  title: string;
  pillar: string;
  status: "جاري" | "مكتمل" | "جاري الطرح" | "في التصميم" | "دراسة أولية" | "لم يبدأ" | "متوقف" | "طور الترسية";
  progress_percentage: number;
  goal_code?: string;
  description?: string;
  current_state?: string;
  target_state?: string;
  start_date?: string;
  target_date?: string;
};

export type BulkGoalRow = {
  code: string;
  title: string;
  strategic_theme?: string;
  color?: string;
  status?: "نشط" | "مكتمل" | "متأخر" | "معلق";
  progress_percentage?: number;
};

export type BulkReportPeriodRow = {
  period_type: "monthly" | "quarterly" | "annual";
  label: string;
  year: number;
  month?: number;
  quarter?: number;
  start_date: string;
  end_date: string;
};

type ImportResult = {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
};

// ── Helpers ────────────────────────────────────────────

async function getGoalMap(supabase: any, userId: string) {
  const { data } = await supabase
    .from("goals")
    .select("id, code")
    .eq("user_id", userId);
  const map: Record<string, string> = {};
  (data ?? []).forEach((g: any) => { map[g.code] = g.id; });
  return map;
}

// ── Bulk Import: Achievements ──────────────────────────

export async function bulkImportAchievements(
  rows: BulkAchievementRow[]
): Promise<ImportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, inserted: 0, skipped: 0, errors: ["غير مسجل الدخول"] };

  const goalMap = await getGoalMap(supabase, user.id);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Validate rows
  const validRows = rows.filter((row, i) => {
    if (!row.title?.trim()) { errors.push(`سطر ${i + 1}: العنوان مطلوب`); skipped++; return false; }
    if (!row.achievement_date) { errors.push(`سطر ${i + 1}: التاريخ مطلوب`); skipped++; return false; }
    if (!["استراتيجي", "تنفيذي"].includes(row.category)) {
      errors.push(`سطر ${i + 1}: التصنيف يجب أن يكون "استراتيجي" أو "تنفيذي"`); skipped++; return false;
    }
    return true;
  });

  // Batch insert (chunks of 50)
  for (let i = 0; i < validRows.length; i += 50) {
    const chunk = validRows.slice(i, i + 50).map((row) => ({
      user_id: user.id,
      title: row.title.trim(),
      achievement_date: row.achievement_date,
      category: row.category,
      description: row.description || null,
      impact: row.impact || null,
      status: row.status || "معتمد",
      goal_id: row.goal_code ? (goalMap[row.goal_code] || null) : null,
      is_highlight: row.is_highlight ?? false,
      is_monthly_reportable: true,
      is_quarterly_reportable: true,
      is_annual_reportable: true,
    }));

    const { error, data } = await supabase
      .from("achievements")
      .insert(chunk)
      .select("id");

    if (error) {
      errors.push(`خطأ في الدفعة ${Math.floor(i / 50) + 1}: ${error.message}`);
    } else {
      inserted += (data ?? []).length;
    }
  }

  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: errors.length === 0, inserted, skipped, errors };
}

// ── Bulk Import: Initiatives ───────────────────────────

export async function bulkImportInitiatives(
  rows: BulkInitiativeRow[]
): Promise<ImportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, inserted: 0, skipped: 0, errors: ["غير مسجل الدخول"] };

  const goalMap = await getGoalMap(supabase, user.id);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  const validRows = rows.filter((row, i) => {
    if (!row.title?.trim()) { errors.push(`سطر ${i + 1}: العنوان مطلوب`); skipped++; return false; }
    if (row.progress_percentage < 0 || row.progress_percentage > 100) {
      errors.push(`سطر ${i + 1}: نسبة الإنجاز يجب أن تكون بين 0 و 100`); skipped++; return false;
    }
    return true;
  });

  for (let i = 0; i < validRows.length; i += 50) {
    const chunk = validRows.slice(i, i + 50).map((row, idx) => ({
      user_id: user.id,
      title: row.title.trim(),
      pillar: row.pillar || null,
      status: row.status,
      progress_percentage: row.progress_percentage,
      goal_id: row.goal_code ? (goalMap[row.goal_code] || null) : null,
      description: row.description || null,
      current_state: row.current_state || null,
      target_state: row.target_state || null,
      start_date: row.start_date || null,
      target_date: row.target_date || null,
      sort_order: i + idx + 1,
    }));

    const { error, data } = await supabase
      .from("development_initiatives")
      .insert(chunk)
      .select("id");

    if (error) {
      errors.push(`خطأ في الدفعة ${Math.floor(i / 50) + 1}: ${error.message}`);
    } else {
      inserted += (data ?? []).length;
    }
  }

  revalidatePath("/initiatives");
  revalidatePath("/");
  return { success: errors.length === 0, inserted, skipped, errors };
}

// ── Bulk Import: Goals ─────────────────────────────────

export async function bulkImportGoals(
  rows: BulkGoalRow[]
): Promise<ImportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, inserted: 0, skipped: 0, errors: ["غير مسجل الدخول"] };

  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  const validRows = rows.filter((row, i) => {
    if (!row.code?.trim()) { errors.push(`سطر ${i + 1}: الرمز مطلوب`); skipped++; return false; }
    if (!row.title?.trim()) { errors.push(`سطر ${i + 1}: العنوان مطلوب`); skipped++; return false; }
    return true;
  });

  for (let i = 0; i < validRows.length; i += 50) {
    const chunk = validRows.slice(i, i + 50).map((row, idx) => ({
      user_id: user.id,
      code: row.code.trim(),
      title: row.title.trim(),
      strategic_theme: row.strategic_theme || null,
      color: row.color || "026D69",
      status: row.status || "نشط",
      progress_percentage: row.progress_percentage ?? 0,
      sort_order: i + idx + 1,
    }));

    const { error, data } = await supabase
      .from("goals")
      .insert(chunk)
      .select("id");

    if (error) {
      errors.push(`خطأ في الدفعة ${Math.floor(i / 50) + 1}: ${error.message}`);
    } else {
      inserted += (data ?? []).length;
    }
  }

  revalidatePath("/goals");
  revalidatePath("/");
  return { success: errors.length === 0, inserted, skipped, errors };
}

// ── Bulk Import: Report Periods ────────────────────────

export async function bulkImportReportPeriods(
  rows: BulkReportPeriodRow[]
): Promise<ImportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, inserted: 0, skipped: 0, errors: ["غير مسجل الدخول"] };

  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  const validRows = rows.filter((row, i) => {
    if (!row.label?.trim()) { errors.push(`سطر ${i + 1}: التسمية مطلوبة`); skipped++; return false; }
    if (!row.start_date || !row.end_date) { errors.push(`سطر ${i + 1}: التواريخ مطلوبة`); skipped++; return false; }
    return true;
  });

  const chunk = validRows.map((row) => ({
    user_id: user.id,
    period_type: row.period_type,
    label: row.label.trim(),
    year: row.year,
    month: row.month || null,
    quarter: row.quarter || null,
    start_date: row.start_date,
    end_date: row.end_date,
  }));

  const { error, data } = await supabase
    .from("report_periods")
    .insert(chunk)
    .select("id");

  if (error) {
    errors.push(error.message);
  } else {
    inserted = (data ?? []).length;
  }

  revalidatePath("/reports");
  revalidatePath("/");
  return { success: errors.length === 0, inserted, skipped, errors };
}

// ── Full Seed: All Data at Once ────────────────────────

export type FullSeedData = {
  goals?: BulkGoalRow[];
  initiatives?: BulkInitiativeRow[];
  achievements?: BulkAchievementRow[];
  report_periods?: BulkReportPeriodRow[];
};

export async function bulkSeedAll(data: FullSeedData): Promise<{
  success: boolean;
  results: Record<string, ImportResult>;
}> {
  const results: Record<string, ImportResult> = {};

  // Order matters: goals first, then initiatives (need goal IDs), then achievements
  if (data.goals?.length) {
    results.goals = await bulkImportGoals(data.goals);
  }
  if (data.initiatives?.length) {
    results.initiatives = await bulkImportInitiatives(data.initiatives);
  }
  if (data.achievements?.length) {
    results.achievements = await bulkImportAchievements(data.achievements);
  }
  if (data.report_periods?.length) {
    results.report_periods = await bulkImportReportPeriods(data.report_periods);
  }

  const allSuccess = Object.values(results).every((r) => r.success);
  return { success: allSuccess, results };
}

// ── Parse Tab-Separated Text (from Excel paste) ────────

export async function parseAndImportAchievements(
  tsvText: string
): Promise<ImportResult> {
  const lines = tsvText.trim().split("\n");
  if (lines.length < 2) return { success: false, inserted: 0, skipped: 0, errors: ["لا توجد بيانات كافية"] };

  // First line is header
  const headers = lines[0].split("\t").map((h) => h.trim());
  const titleIdx = headers.findIndex((h) => h.includes("عنوان") || h.toLowerCase().includes("title"));
  const dateIdx = headers.findIndex((h) => h.includes("تاريخ") || h.toLowerCase().includes("date"));
  const catIdx = headers.findIndex((h) => h.includes("تصنيف") || h.includes("فئة") || h.toLowerCase().includes("category"));
  const descIdx = headers.findIndex((h) => h.includes("وصف") || h.toLowerCase().includes("description"));
  const impactIdx = headers.findIndex((h) => h.includes("أثر") || h.toLowerCase().includes("impact"));
  const goalIdx = headers.findIndex((h) => h.includes("هدف") || h.toLowerCase().includes("goal"));

  if (titleIdx === -1) return { success: false, inserted: 0, skipped: 0, errors: ["لم يتم العثور على عمود العنوان"] };
  if (dateIdx === -1) return { success: false, inserted: 0, skipped: 0, errors: ["لم يتم العثور على عمود التاريخ"] };

  const rows: BulkAchievementRow[] = lines.slice(1).filter((l) => l.trim()).map((line) => {
    const cols = line.split("\t").map((c) => c.trim());
    return {
      title: cols[titleIdx] || "",
      achievement_date: cols[dateIdx] || "",
      category: (cols[catIdx]?.includes("استراتيجي") ? "استراتيجي" : "تنفيذي") as any,
      description: descIdx >= 0 ? cols[descIdx] : undefined,
      impact: impactIdx >= 0 ? cols[impactIdx] : undefined,
      goal_code: goalIdx >= 0 ? cols[goalIdx] : undefined,
    };
  });

  return bulkImportAchievements(rows);
}
