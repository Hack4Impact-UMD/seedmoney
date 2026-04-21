import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";
import { createBrowserClient } from "@/src/lib/supabase-client";

export async function readAllCompetitions(): Promise<CompetitionMetadata[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("competition_metadata")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error reading all competitions:", error.message);
    return [];
  }

  return (data ?? []) as CompetitionMetadata[];
}

export async function readCurrentCompetition(): Promise<CompetitionMetadata> {
  const supabase = await createBrowserClient();
  const { data, error } = await supabase
    .from("competition_metadata")
    .select()
    .eq("is_current", true)
    .single();

  return data as CompetitionMetadata;
}
