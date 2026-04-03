"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

export type InitiativeFormData = {
  title: string;
  goal_id?: string | null;
  pillar?: string;
  description?: string;
  current_state?: string;
  target_state?: string;
  status: "جاري" | "مكتمل" | "جاري الطرح" | "في التصميم" | "دراسة أولية" | "لم يبدأ" | "متوقف" | "طور الترسية";
  priority?: number;
  start_date?: string | null;
  target_date?: string | null;
  progress_percentage?: number;
  impact_statement?: string;
  notes?: string;
};

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createInitiative(data: InitiativeFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { data: row, error } = await supabase
    .from("development_initiatives")
    .insert<Database["public"]["Tables"]["development_initiatives"]["Insert"]>({
      user_id: user.id,
      title: data.title,
      goal_id: data.goal_id || null,
      pillar: data.pillar || null,
      description: data.description || null,
      current_state: data.current_state || null,
      target_state: data.target_state || null,
      status: data.status,
      priority: data.priority ?? 1,
      start_date: data.start_date || null,
      target_date: data.target_date || null,
      progress_percentage: data.progress_percentage ?? 0,
      impact_statement: data.impact_statement || null,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/initiatives");
  revalidatePath("/");
  return { success: true, id: row.id };
}

export async function updateInitiative(id: string, data: InitiativeFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("development_initiatives")
    .update({
      title: data.title,
      goal_id: data.goal_id || null,
      pillar: data.pillar || null,
      description: data.description || null,
      current_state: data.current_state || null,
      target_state: data.target_state || null,
      status: data.status,
      priority: data.priority ?? 1,
      start_date: data.start_date || null,
      target_date: data.target_date || null,
      progress_percentage: data.progress_percentage ?? 0,
      impact_statement: data.impact_statement || null,
      notes: data.notes || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/initiatives");
  revalidatePath("/");
  return { success: true, id };
}

export async function deleteInitiative(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase.from("development_initiatives").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/initiatives");
  revalidatePath("/");
  return { success: true };
}
