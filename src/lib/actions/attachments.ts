"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AttachmentMeta = {
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  notes?: string;
  goal_id?: string | null;
  initiative_id?: string | null;
  achievement_id?: string | null;
  report_id?: string | null;
};

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createAttachment(data: AttachmentMeta): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  const { data: row, error } = await supabase
    .from("attachments")
    .insert({
      user_id: user.id,
      file_name: data.file_name,
      file_path: data.file_path,
      file_type: data.file_type,
      file_size: data.file_size,
      notes: data.notes || null,
      goal_id: data.goal_id || null,
      initiative_id: data.initiative_id || null,
      achievement_id: data.achievement_id || null,
      report_id: data.report_id || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/archive");
  return { success: true, id: row.id };
}

export async function deleteAttachment(id: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مسجل الدخول" };

  // Delete file from storage
  await supabase.storage.from("attachments").remove([filePath]);

  // Delete DB record
  const { error } = await supabase.from("attachments").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/archive");
  return { success: true };
}
