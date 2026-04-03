import { createClient } from "@/lib/supabase/server";
import { AchievementList } from "@/components/achievements/achievement-list";

export default async function AchievementsPage() {
  const supabase = await createClient();

  const [
    { data: achievements },
    { data: goals },
    { data: initiatives },
  ] = await Promise.all([
    supabase
      .from("achievements")
      .select("*")
      .order("achievement_date", { ascending: false }),
    supabase
      .from("goals")
      .select("id, code, title")
      .order("sort_order"),
    supabase
      .from("development_initiatives")
      .select("id, title, goal_id")
      .order("sort_order"),
  ]);

  return (
    <AchievementList
      achievements={achievements ?? []}
      goals={goals ?? []}
      initiatives={initiatives ?? []}
    />
  );
}
