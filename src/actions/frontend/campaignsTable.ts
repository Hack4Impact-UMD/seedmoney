"use server"

import { createServerClient } from "@/src/lib/supabase-client";
import { Campaign } from "@/src/types";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

// Temporary type
type RawCampaignRow = Campaign & {
  campaign_members: {
    role: string;
    users: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
  }[];
};

function mapCampaignLeader(campaign:RawCampaignRow): CampaignWithLeader {
  const leaders = campaign.campaign_members || [];

  const sortedLeaders = [...leaders].sort((a, b) => {
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

export async function readApprovedCampaigns(competition_id?: number): Promise<CampaignWithLeader[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(BASE_SELECT)
    .eq("competition_id", competition_id)
    .in("status", ["approved", "published"])
    .eq("campaign_members.role", "campaign_leader");

  if (error) throw error;
  return (data ?? []).map(mapCampaignLeader);
}

export async function readPreviousCampaigns(
  currentCompetitionId?: number,
): Promise<CampaignWithLeader[]> {
  if (currentCompetitionId === undefined) {
    return [];
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(BASE_SELECT)
    .neq("competition_id", currentCompetitionId)
    .neq("status", "in_progress")
    .eq("campaign_members.role", "campaign_leader")
    .order("date_created", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCampaignLeader);
}

export async function readPreviousChallengeApplications(user_id?: string): Promise<CampaignWithLeader[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Error reading authenticated user for view-all campaigns:",
      userError?.message ?? "No authenticated user found",
    );
    return [];
  }

  if (user_id && user_id !== user.id) {
    console.error(
      "Mismatched user id passed to readPreviousChallengeApplications:",
      user_id,
    );
    return [];
  }

  const query = supabase
    .from("campaigns")
    .select(BASE_SELECT)
    .eq("campaign_members.role", "campaign_leader")
    .eq("campaign_members.user_id", user.id)
    .neq("status", "in_progress")
    .order("date_created", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(mapCampaignLeader);
}
