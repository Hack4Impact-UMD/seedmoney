"use server"

import { createServerClient } from "@/src/lib/supabase-client";
import { CampaignWithLeader } from "@/src/types/frontend/campaigns";
import { CampaignMember } from "@/src/types";

export async function readOngoingChallengeApplications(competition_id: number): Promise<CampaignWithLeader[]> {
  const supabase = await createServerClient();

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
    .eq("competition_id", competition_id)
    .eq("status", "published")
    .eq("campaign_members.role", "campaign_leader")
  
  if (error) throw error;

  if (!data) return [];

  return data.map(campaign => {
    const leaders = campaign.campaign_members || [];

    const sortedLeaders = [...leaders].sort((a, b) => {
      const userA = Array.isArray(a.users) ? a.users[0] : a.users;
      const userB = Array.isArray(b.users) ? b.users[0] : b.users;

      const nameA = `${userA?.first_name || ""} ${userA?.last_name || ""}`.trim().toLowerCase();
      const nameB = `${userB?.first_name || ""} ${userB?.last_name || ""}`.trim().toLowerCase();

      return nameA.localeCompare(nameB);
    })

    const leaderMember = sortedLeaders[0];
    const leaderUser = Array.isArray(leaderMember?.users) 
      ? leaderMember.users[0] 
      : leaderMember?.users;

    return {
      ...campaign,
      campaign_leader: leaderUser ? `${leaderUser.first_name} ${leaderUser.last_name}` : "",
    } as CampaignWithLeader
  });
}