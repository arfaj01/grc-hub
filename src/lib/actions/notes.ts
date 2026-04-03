"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NoteFormData = {
  title?: string;
  body: string;
  note_type: "عام" | "استراتيجي" | "تحدي" | "فرصة" | "مستقبلي" | "ملاحظة تقرير";
  note_date: string;
  goal_id?: string | null;
  initiative_id?: string | null;
  achievement_id?: string | null;
};

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createNote(data: NoteFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { data: row, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: data.title || null,
      body: data.body,
      note_type: data.note_type,
      note_date: data.note_date,
      goal_id: data.goal_id || null,
      initiative_id: data.initiative_id || null,
      achievement_id: data.achievement_id || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/notes");
  return { success: true, id: row.id };
}

export async function updateNote(id: string, data: NoteFormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase
    .from("notes")
    .update({
      title: data.title || null,
      body: data.body,
      note_type: data.note_type,
      note_date: data.note_date,
      goal_id: data.goal_id || null,
      initiative_id: data.initiative_id || null,
      achievement_id: data.achievement_id || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/notes");
  return { success: true, id };
}

export async function deleteNote(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/notes");
  return { success: true };
}
