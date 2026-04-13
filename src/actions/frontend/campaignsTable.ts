"use server"

import { createServerClient } from "@/src/lib/supabase-client";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

function mapCampaignLeader(campaign: any): CampaignWithLeader {
  const leaders = campaign.campaign_members || [];

  const sortedLeaders = [...leaders].sort((a: any, b: any) => {
    const userA = Array.isArray(a.users) ? a.users[0] : a.users;
    const userB = Array.isArray(b.users) ? b.users[0] : b.users;
    const nameA = `${userA?.first_name || ""} ${userA?.last_name || ""}`.trim().toLowerCase();
    const nameB = `${userB?.first_name || ""} ${userB?.last_name || ""}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const leaderUser = (() => {
    const m = sortedLeaders[0];
    return Array.isArray(m?.users) ? m.users[0] : m?.users;
  })();

  return {
    ...campaign,
    campaign_leader: leaderUser ? `${leaderUser.first_name} ${leaderUser.last_name}` : "",
  } as CampaignWithLeader;
}

const BASE_SELECT = `
  *,
  campaign_members!inner(
    role,
    users!inner(
      first_name,
      last_name
    )
  )`;

export async function readOngoingCampaigns(competition_id?: number): Promise<CampaignWithLeader[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(BASE_SELECT)
    .eq("competition_id", competition_id)
    .eq("status", "approved")
    .eq("campaign_members.role", "campaign_leader");

  if (error) throw error;
  return (data ?? []).map(mapCampaignLeader);
}

export async function readPreviousChallengeApplications(user_id?: string): Promise<CampaignWithLeader[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(BASE_SELECT)
    .eq("status", "archived")
    .eq("campaign_members.role", "campaign_leader")
    .eq("campaign_members.user_id", user_id);

  if (error) throw error;
  return (data ?? []).map(mapCampaignLeader);
}