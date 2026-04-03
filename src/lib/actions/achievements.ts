"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AchievementFormData = {
  title: string;
  achievement_date: string;
  category: "استراتيجي" | "تنفيذي";
  summary?: string;
  description?: string;
  impact?: string;
  status: "مسودة" | "معتمد" | "مميز";
  goal_id?: string | null;
  initiative_id?: string | null;
  source_reference?: string;
  is_monthly_reportable: boolean;
  is_quarterly_reportable: boolean;
  is_annual_reportable: boolean;
  is_highlight: boolean;
};

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createAchievement(data: AchievementFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { data: row, error } = await supabase
    .from("achievements")
    .insert({
      user_id: user.id,
      title: data.title,
      achievement_date: data.achievement_date,
      category: data.category,
      summary: data.summary || null,
      description: data.description || null,
      impact: data.impact || null,
      status: data.status,
      goal_id: data.goal_id || null,
      initiative_id: data.initiative_id || null,
      source_reference: data.source_reference || null,
      is_monthly_reportable: data.is_monthly_reportable,
      is_quarterly_reportable: data.is_quarterly_reportable,
      is_annual_reportable: data.is_annual_reportable,
      is_highlight: data.is_highlight,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: true, id: row.id };
}

export async function updateAchievement(id: string, data: AchievementFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("achievements")
    .update({
      title: data.title,
      achievement_date: data.achievement_date,
      category: data.category,
      summary: data.summary || null,
      description: data.description || null,
      impact: data.impact || null,
      status: data.status,
      goal_id: data.goal_id || null,
      initiative_id: data.initiative_id || null,
      source_reference: data.source_reference || null,
      is_monthly_reportable: data.is_monthly_reportable,
      is_quarterly_reportable: data.is_quarterly_reportable,
      is_annual_reportable: data.is_annual_reportable,
      is_highlight: data.is_highlight,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteAchievement(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: true };
}
