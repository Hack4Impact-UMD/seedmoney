"use server";

import { createServerClient } from "@/src/lib/supabase-client";
import { OwnedCampaign } from "@/src/types/accountDeletion";


export async function getOwnedCampaigns(): Promise<OwnedCampaign[]> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      campaign_id,
      name,
      status,
      raised,
      campaign_members!inner(user_id, role)
    `)
    .eq("campaign_members.user_id", user.id)
    .eq("campaign_members.role", "campaign_leader");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((campaign) => ({
    campaign_id: campaign.campaign_id,
    name: campaign.name,
    status: campaign.status,
    raised: campaign.raised
  })) as OwnedCampaign[];
}

