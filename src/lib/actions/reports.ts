"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  buildReportSnapshot,
  getMonthlyPeriod,
  getQuarterlyPeriod,
  getAnnualPeriod,
  generateReportTitle,
} from "@/lib/queries/reports";
import type { ReportSnapshot } from "@/lib/queries/reports";

type ActionResult = { success: true; id: string } | { success: false; error: string };

/* ═══════════════════════════════════════════════════════════════
   Generate a new report: create period (if needed) → build
   snapshot → create report row → return id.
   ═══════════════════════════════════════════════════════════════ */

export type GenerateReportInput = {
  periodType: "monthly" | "quarterly" | "annual";
  year: number;
  month?: number;   // required for monthly
  quarter?: number;  // required for quarterly
};

export async function generateReport(input: GenerateReportInput): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  // Resolve period dates + label
  let periodInfo: { start_date: string; end_date: string; label: string };
  if (input.periodType === "monthly") {
    if (!input.month) return { success: false, error: "الشهر مطلوب" };
    periodInfo = getMonthlyPeriod(input.year, input.month);
  } else if (input.periodType === "quarterly") {
    if (!input.quarter) return { success: false, error: "الربع مطلوب" };
    periodInfo = getQuarterlyPeriod(input.year, input.quarter);
  } else {
    periodInfo = getAnnualPeriod(input.year);
  }

  // Find or create period
  let periodId: string;

  const { data: existingPeriod } = await supabase
    .from("report_periods")
    .select("id")
    .eq("period_type", input.periodType)
    .eq("year", input.year)
    .eq("start_date", periodInfo.start_date)
    .maybeSingle();

  if (existingPeriod) {
    periodId = existingPeriod.id;
  } else {
    const { data: newPeriod, error: periodError } = await supabase
      .from("report_periods")
      .insert({
        user_id: user.id,
        period_type: input.periodType,
        label: periodInfo.label,
        year: input.year,
        month: input.month ?? null,
        quarter: input.quarter ?? null,
        start_date: periodInfo.start_date,
        end_date: periodInfo.end_date,
        status: "مفتوح",
      })
      .select("id")
      .single();

    if (periodError) return { success: false, error: periodError.message };
    periodId = newPeriod.id;
  }

  // Build snapshot
  const snapshot = await buildReportSnapshot(
    input.periodType,
    periodInfo.start_date,
    periodInfo.end_date,
    periodInfo.label,
    input.year,
    input.month,
    input.quarter,
  );

  // Create report
  const title = generateReportTitle(input.periodType, periodInfo.label);

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      period_id: periodId,
      report_type: input.periodType,
      title,
      generated_snapshot: snapshot as unknown as Record<string, unknown>,
      status: "مسودة",
    })
    .select("id")
    .single();

  if (reportError) return { success: false, error: reportError.message };

  revalidatePath("/reports");
  return { success: true, id: report.id };
}

/* ═══════════════════════════════════════════════════════════════
   Update report summaries (executive writes narrative text)
   ═══════════════════════════════════════════════════════════════ */

export type UpdateReportInput = {
  executive_summary?: string;
  overall_progress_summary?: string;
  achievements_summary?: string;
  challenges_summary?: string;
  next_steps_summary?: string;
  title?: string;
};

export async function updateReport(id: string, data: UpdateReportInput): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("reports")
    .update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.executive_summary !== undefined && { executive_summary: data.executive_summary }),
      ...(data.overall_progress_summary !== undefined && { overall_progress_summary: data.overall_progress_summary }),
      ...(data.achievements_summary !== undefined && { achievements_summary: data.achievements_summary }),
      ...(data.challenges_summary !== undefined && { challenges_summary: data.challenges_summary }),
      ...(data.next_steps_summary !== undefined && { next_steps_summary: data.next_steps_summary }),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/reports");
  revalidatePath(`/reports/${id}`);
  return { success: true, id };
}

/* ═══════════════════════════════════════════════════════════════
   Finalize report (change status)
   ═══════════════════════════════════════════════════════════════ */

export async function updateReportStatus(
  id: string,
  status: "مسودة" | "معتمد" | "منشور",
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/reports");
  revalidatePath(`/reports/${id}`);
  return { success: true, id };
}

/* ═══════════════════════════════════════════════════════════════
   Re-generate snapshot (refresh data for an existing report)
   ═══════════════════════════════════════════════════════════════ */

export async function regenerateSnapshot(reportId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  // Fetch the report to get period info
  const { data: report } = await supabase
    .from("reports")
    .select("*, period:report_periods(*)")
    .eq("id", reportId)
    .single();

  if (!report) return { success: false, error: "التقرير غير موجود" };
  if (!report.period) return { success: false, error: "الفترة غير محددة" };

  const period = report.period as {
    period_type: "monthly" | "quarterly" | "annual";
    start_date: string;
    end_date: string;
    label: string;
    year: number;
    month: number | null;
    quarter: number | null;
  };

  const snapshot = await buildReportSnapshot(
    period.period_type,
    period.start_date,
    period.end_date,
    period.label,
    period.year,
    period.month ?? undefined,
    period.quarter ?? undefined,
  );

  const { error } = await supabase
    .from("reports")
    .update({ generated_snapshot: snapshot as unknown as Record<string, unknown> })
    .eq("id", reportId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/reports/${reportId}`);
  return { success: true, id: reportId };
}

/* ═══════════════════════════════════════════════════════════════
   Delete report
   ═══════════════════════════════════════════════════════════════ */

export async function deleteReport(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/reports");
  return { success: true };
}
