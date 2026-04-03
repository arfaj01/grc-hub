import { createClient } from "@/lib/supabase/server";
import { ArchiveList } from "@/components/archive/archive-list";

export default async function ArchivePage() {
  const supabase = await createClient();

  const [
    { data: attachments },
    { data: goals },
    { data: initiatives },
    { data: achievements },
  ] = await Promise.all([
    supabase.from("attachments").select("*").order("created_at", { ascending: false }),
    supabase.from("goals").select("id, code, title").order("sort_order"),
    supabase.from("development_initiatives").select("id, title").order("sort_order"),
    supabase.from("achievements").select("id, title").order("achievement_date", { ascending: false }).limit(50),
  ]);

  return (
    <ArchiveList
      attachments={attachments ?? []}
      goals={goals ?? []}
      initiatives={initiatives ?? []}
      achievements={achievements ?? []}
    />
  );
}
