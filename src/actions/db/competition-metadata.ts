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

export async function readCurrentCompetition(): Promise<CompetitionMetadata | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("competition_metadata")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(1);

  if (error) {
    console.error("readCurrentCompetition error:", error.code, error.message);
    return null;
  }

  if (!data || data.length === 0) return null;
  return data[0] as CompetitionMetadata;
}

export async function readCompetitionById(
  competitionId: number,
): Promise<CompetitionMetadata | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("competition_metadata")
    .select("*")
    .eq("competition_id", competitionId)
    .single();

  if (error) {
    console.error("Error reading competition by id:", error.message);
    return null;
  }

  return data as CompetitionMetadata;
}