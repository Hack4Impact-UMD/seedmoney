"use server";

import type { Campaign, CampaignMember } from "@/src/types";
import { createBrowserClient, createServerClient } from "@/src/lib/supabase-client";

export async function createCampaign(
  data: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = await createBrowserClient();

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
  const supabase = await createBrowserClient();


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

export async function readOngoingChallengeApplications() {
  const supabase = await createServerClient();

  // reading current competition
  const { data: competition, error: compError } = await supabase
    .from("competition_metadata")
    .select()
    .eq("is_current", true)
    .single();

  console.log("competition:", competition, "error:", compError);

  if (compError || !competition) throw new Error("No ongoing challenge found");

  // retrieve campaigns from current competition
  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      campaign_members!inner(
        role,
        users!inner(
          first_name,
          last_name
        )
      )`)
    .eq("competition_id", competition.competition_id)
    .eq("status", "approved")
  
  console.log("campaigns data:", data, "error:", error);
  
  if (error) throw error;

  return data.map(campaign => {
    const leaderMember = campaign.campaign_members.find((member: CampaignMember) => member.role === "campaign_leader") || campaign.campaign_members[0];
    const leaderUser = Array.isArray(leaderMember?.users) 
      ? leaderMember.users[0] 
      : leaderMember?.users;

    return {
      ...campaign,
      campaign_leader: leaderUser ? `${leaderUser.first_name} ${leaderUser.last_name}` : "",
    }
  });
}