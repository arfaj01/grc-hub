import { createClient } from "@/lib/supabase/server";
import { InitiativeList } from "@/components/initiatives/initiative-list";

export default async function InitiativesPage() {
  const supabase = await createClient();

  const [
    { data: initiatives },
    { data: goals },
  ] = await Promise.all([
    supabase
      .from("development_initiatives")
      .select("*")
      .order("sort_order"),
    supabase
      .from("goals")
      .select("id, code, title")
      .order("sort_order"),
  ]);

  return (
    <InitiativeList
      initiatives={initiatives ?? []}
      goals={goals ?? []}
    />
  );
}
