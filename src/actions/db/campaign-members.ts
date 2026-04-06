import type { CampaignMember } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { readCampaign } from "./campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export async function createCampaignMember(
  data: CampaignMember,
): Promise<CampaignMember | null> {
  const supabase = await createServerClient();

  const { data: insertedData, error } = await supabase
    .from("campaign_members")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign member: ", error.message);
    return null;
  }

  return insertedData as CampaignMember;
}

export async function readCampaignMember(
  campaign_id: number,
  user_id: string,
): Promise<CampaignMember | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaign_members")
    .select()
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching campaign member: ", error.message);
    return null;
  }

  return data as CampaignMember;
}

export async function updateCampaignMember(
  campaign_id: number,
  user_id: string,
  data: Pick<CampaignMember, "role">,
): Promise<CampaignMember | null> {
  const supabase = await createServerClient();

  const { data: updatedData, error } = await supabase
    .from("campaign_members")
    .update(data)
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) {
    console.error("Error updating campaign member: ", error.message);
    return null;
  }

  return updatedData as CampaignMember;
}

export async function deleteCampaignMember(
  campaign_id: number,
  user_id: string,
): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaign_members")
    .delete()
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id)
    .select("campaign_id,user_id");

  if (error) {
    console.error("Error deleting campaign member: ", error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn("Campaign member not found for deletion:", {
      campaign_id,
      user_id,
    });
    return false;
  }

  return true;
}

export async function readCampaignsFromMembers(user_id: string) {

  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("user_id", user_id);


  if (error) {
    console.error("Error reading campaign members:", error.message);
    return null;
  }

  if (!data || data.length === 0) return [];

  const campaignIds = data.map((d) => d.campaign_id);

  const campaigns = await readCampaign(campaignIds);

  
  return campaigns as Campaign[];
}