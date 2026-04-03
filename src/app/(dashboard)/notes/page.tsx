import { createClient } from "@/lib/supabase/server";
import { NoteList } from "@/components/notes/note-list";

export default async function NotesPage() {
  const supabase = await createClient();

  const [
    { data: notes },
    { data: goals },
    { data: initiatives },
    { data: achievements },
  ] = await Promise.all([
    supabase.from("notes").select("*").order("note_date", { ascending: false }),
    supabase.from("goals").select("id, code, title").order("sort_order"),
    supabase.from("development_initiatives").select("id, title").order("sort_order"),
    supabase.from("achievements").select("id, title").order("achievement_date", { ascending: false }).limit(50),
  ]);

  return (
    <NoteList
      notes={notes ?? []}
      goals={goals ?? []}
      initiatives={initiatives ?? []}
      achievements={achievements ?? []}
    />
  );
}
