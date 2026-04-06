import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";
import { createBrowserClient } from "@/src/lib/supabase-client";

export async function readCurrentCompetition(): Promise<CompetitionMetadata> {
  const supabase = await createBrowserClient();
  const { data, error } = await supabase
    .from("competition_metadata")
    .select()
    .eq("is_current", true)
    .single()

  return data as CompetitionMetadata;
}