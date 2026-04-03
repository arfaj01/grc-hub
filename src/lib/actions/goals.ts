"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

export type GoalFormData = {
  code: string;
  title: string;
  strategic_theme?: string;
  description?: string;
  success_metric_label?: string;
  baseline_value?: number | null;
  target_value?: number | null;
  current_value?: number | null;
  progress_percentage?: number;
  status: "نشط" | "مكتمل" | "متأخر" | "معلق";
  priority?: number;
  color?: string;
  start_date?: string | null;
  target_date?: string | null;
  executive_comment?: string;
};

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createGoal(data: GoalFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { data: row, error } = await supabase
    .from("goals")
    .insert<Database["public"]["Tables"]["goals"]["Insert"]>({
      user_id: user.id,
      code: data.code,
      title: data.title,
      strategic_theme: data.strategic_theme || null,
      description: data.description || null,
      success_metric_label: data.success_metric_label || null,
      baseline_value: data.baseline_value ?? null,
      target_value: data.target_value ?? null,
      current_value: data.current_value ?? null,
      progress_percentage: data.progress_percentage ?? 0,
      status: data.status,
      priority: data.priority ?? 1,
      color: data.color || null,
      start_date: data.start_date || null,
      target_date: data.target_date || null,
      executive_comment: data.executive_comment || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true, id: row.id };
}

export async function updateGoal(id: string, data: GoalFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("goals")
    .update({
      code: data.code,
      title: data.title,
      strategic_theme: data.strategic_theme || null,
      description: data.description || null,
      success_metric_label: data.success_metric_label || null,
      baseline_value: data.baseline_value ?? null,
      target_value: data.target_value ?? null,
      current_value: data.current_value ?? null,
      progress_percentage: data.progress_percentage ?? 0,
      status: data.status,
      priority: data.priority ?? 1,
      color: data.color || null,
      start_date: data.start_date || null,
      target_date: data.target_date || null,
      executive_comment: data.executive_comment || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  revalidatePath("/");
  return { success: true };
}
