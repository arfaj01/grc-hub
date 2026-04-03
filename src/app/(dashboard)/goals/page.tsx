import { createClient } from "@/lib/supabase/server";
import { GoalList } from "@/components/goals/goal-list";

export default async function GoalsPage() {
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .order("sort_order");

  return <GoalList goals={goals ?? []} />;
}
