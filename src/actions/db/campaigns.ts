import type { Campaign } from "@/src/types";
import { createBrowserClient, createServerClient } from "@/src/lib/supabase-client";

export async function createCampaign(
  data: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = await createBrowserClient();
  const campaignData = { ...data };

  if (!campaignData.user_id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      campaignData.user_id = user.id;
    }
  }

  const { data: insertedData, error } = await supabase
    .from("campaigns")
    .insert(campaignData)
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
  const supabase = createBrowserClient();

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
    console.log(ids);
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
  if (ids.length === 0) {
    return [];
  }

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

export async function updateCampaign(
  id: number,
  campaign: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = await createBrowserClient();
  console.log("updateCampaign called", id, campaign);

  const { data, error } = await supabase
    .from("campaigns")
    .update(campaign)
    .eq("campaign_id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error updating campaign:", error.message);
    return null;
  }

  if (!data) {
    console.warn("Campaign not found for update:", id);
    return null;
  }

  return data as Campaign;
}

export async function updateCampaignGivebutterID(
  id: number,
  campaign: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = await createBrowserClient();
  console.log("updateCampaign called", id, campaign);

  const { data, error } = await supabase
    .from("campaigns")
    .update(campaign)
    .eq("givebutter_id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error updating campaign:", error.message);
    return null;
  }

  if (!data) {
    console.warn("Campaign not found for update:", id);
    return null;
  }

  return data as Campaign;
}

export async function deleteCampaign(id: number): Promise<boolean> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("campaigns")
    .delete()
    .eq("campaign_id", id)
    .select("campaign_id");

  if (error) {
    console.error("Error deleting campaign:", error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn("Campaign not found for deletion:", id);
    return false;
  }

  return true;
}

export async function readCurrentDraftCampaignForUser(user_id: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user_id)
    .eq("status", "in_progress")
    .order("date_created", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error reading campaign:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  return data[0] as Campaign;
}
