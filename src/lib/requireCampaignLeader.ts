import "server-only";

import { createServerClient } from "@/src/lib/supabase-client";

export async function requireCampaignLeader(campaignId: number) {
  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    throw new Error("Invalid campaign ID");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: member, error } = await supabase
    .from("campaign_members")
    .select("role")
    .eq("campaign_id", campaignId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || member?.role !== "campaign_leader") {
    throw new Error("Not authorized");
  }

  return { supabase, user };
}
