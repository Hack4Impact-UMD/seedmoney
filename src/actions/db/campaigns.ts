"use server";

import type { Campaign, CampaignMember } from "@/src/types";
import { createBrowserClient, createServerClient } from "@/src/lib/supabase-client";
import { CampaignWithLeader } from "@/src/types/frontend/campaigns";


export async function createCampaign(
  data: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = createBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const campaignData = { ...data };

  if (userError || !user) {
    console.error(
      "Error reading authenticated user for campaign creation:",
      userError?.message ?? "No authenticated user found",
    );
    return null;
  }

  if (
    campaignData.competition_id === undefined ||
    campaignData.competition_id === null
  ) {
    const { data: currentCompetition, error: competitionError } = await supabase
      .from("competition_metadata")
      .select("competition_id")
      .eq("is_current", true)
      .single();

    if (competitionError || !currentCompetition) {
      console.error(
        "Error reading current competition:",
        competitionError?.message ?? "No current competition found",
      );
      return null;
    }

    campaignData.competition_id = currentCompetition.competition_id;
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

  const { error: campaignMemberError } = await supabase
    .from("campaign_members")
    .insert({
      campaign_id: insertedData.campaign_id,
      user_id: user.id,
      role: "campaign_leader",
    });

  if (campaignMemberError) {
    await supabase
      .from("campaigns")
      .delete()
      .eq("campaign_id", insertedData.campaign_id);
    console.error(
      "Error creating campaign member:",
      campaignMemberError.message,
    );
    return null;
  }

  return insertedData as Campaign;
}

export async function createCampaignGivebutter(
  data: Partial<Campaign>,
): Promise<Campaign | null> {
  const supabase = await createServerClient();
  const campaignData = { ...data };

  if (
    campaignData.competition_id === undefined ||
    campaignData.competition_id === null
  ) {
    const { data: currentCompetition, error: competitionError } = await supabase
      .from("competition_metadata")
      .select("competition_id")
      .eq("is_current", true)
      .single();

    if (competitionError || !currentCompetition) {
      console.error(
        "Error reading current competition:",
        competitionError?.message ?? "No current competition found",
      );
      return null;
    }

    campaignData.competition_id = currentCompetition.competition_id;
  }

  const { data: insertedData, error } = await supabase
    .from("campaigns")
    .insert(campaignData)
    .select()
    .single();

  if (error) {
    console.error("Error creating Givebutter campaign:", error.message);
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

export async function readOngoingChallengeApplications(): Promise<CampaignWithLeader[]> {
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
    } as CampaignWithLeader
  });
}

export async function readCurrentDraftCampaignForUser(user_id: string) {
  const supabase = await createServerClient();

  const { data: campaignMembers, error: membersError } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user_id)
    .eq("role", "campaign_leader")
    .order("campaign_id", { ascending: false });

  if (membersError) {
    console.error("Error reading campaign members:", membersError.message);
    return null;
  }

  if (!campaignMembers || campaignMembers.length === 0) {
    return null;
  }

  const campaignIds = campaignMembers.map((member) => member.campaign_id);
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .in("campaign_id", campaignIds)
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
