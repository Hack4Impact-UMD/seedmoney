import type { Campaign } from "@/src/types";
import { createBrowserClient } from "@/src/lib/supabase-client";

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

export type CampaignUnderReviewRow = {
  campaign_id: number;
  name: string;
  raised: number;
  goal: number;
  status: string;
  leader_name: string;
  date_created: string;
};

export async function readCampaignsUnderReview(
  competitionId: number,
): Promise<CampaignUnderReviewRow[]> {
  const supabase = createBrowserClient();

  const { data: campaignsData, error: campaignsError } = await supabase
    .from("campaigns")
    .select("campaign_id, name, raised, goal, status, date_created, campaign_members(user_id, role)")
    .in("status", ["submitted_under_review", "not_approved"])
    .eq("competition_id", competitionId);

  if (campaignsError) {
    console.error("Error fetching campaigns under review:", campaignsError.message);
    return [];
  }

  const campaigns = (campaignsData ?? []) as {
    campaign_id: number;
    name: string;
    raised: number;
    goal: number;
    status: string;
    date_created: string;
    campaign_members: { user_id: string; role: string | null }[];
  }[];

  const leaderIdByCampaign: Record<number, string> = {};
  for (const c of campaigns) {
    const members = Array.isArray(c.campaign_members) ? c.campaign_members : [];
    const leader = members.find((m) => m.role === "campaign_leader");
    if (leader?.user_id) {
      leaderIdByCampaign[c.campaign_id] = leader.user_id;
    }
  }

  const uniqueLeaderIds = [...new Set(Object.values(leaderIdByCampaign))];

  const usersMap: Record<string, string> = {};
  if (uniqueLeaderIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .in("id", uniqueLeaderIds);

    if (usersError) {
      console.error("Error fetching leader users:", usersError.message);
    } else {
      for (const u of usersData ?? []) {
        usersMap[u.id] = `${u.first_name} ${u.last_name}`.trim();
      }
    }
  }

  return campaigns.map((c) => ({
    campaign_id: c.campaign_id,
    name: c.name ?? "",
    raised: c.raised ?? 0,
    goal: c.goal ?? 0,
    status: c.status,
    date_created: c.date_created ?? "",
    leader_name: usersMap[leaderIdByCampaign[c.campaign_id]] ?? "",
  }));
}
