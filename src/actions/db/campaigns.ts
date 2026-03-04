import type { Campaign, NewCampaign } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";

export async function createCampaign(
  data: NewCampaign,
): Promise<Campaign | null> {
  const supabase = await createServerClient();

  const { data: insertedData, error } = await supabase
    .from("campaigns")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error.message);
    return null;
  }

  return insertedData as Campaign;
}

export async function readCampaign(
  ids?: number | number[],
): Promise<Campaign | Campaign[] | null> {
  const supabase = await createServerClient();

  // Return ALL campaigns
  if (ids === undefined) {
    const { data, error } = await supabase.from("campaigns").select("*");

    if (error) {
      console.error("Error fetching campaigns:", error.message);
      return null;
    }

    return data as Campaign[];
  }

  // Return a SINGLE campaign by ID
  if (typeof ids === "number") {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("campaign_id", ids)
      .maybeSingle();

    if (error) {
      console.error("Error reading campaign:", error.message);
      return null;
    }

    return data as Campaign;
  }

  // Return MULTIPLE campaigns by array of IDs
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .in("campaign_id", ids);

  if (error) {
    console.error("Error reading campaigns:", error.message);
    return null;
  }

  return data as Campaign[];
}

export async function updateCampaign(id: number, data: Partial<NewCampaign>) {
  const supabase = await createServerClient();

  const { error } = await supabase.from("campaigns").update(data).eq("id", id);

  if (error) {
    console.error("Error updating campaign:", error.message);
    return;
  }
}

export async function deleteCampaign(id: number) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("campaign_id", id);

  if (error) {
    console.error("Error deleting campaign:", error.message);
    return;
  }
}
