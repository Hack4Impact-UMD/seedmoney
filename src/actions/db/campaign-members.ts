import { Campaign_Member } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";

export async function createCampaignMember(
  data: Campaign_Member,
): Promise<Campaign_Member | null> {
  const { data: insertedData, error } = await supabase
    .from("campaign_members")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign member: ", error.message);
    return null;
  }

  return insertedData as Campaign_Member;
}

export async function readCampaignMember(
  campaign_id: number,
  user_id: string,
): Promise<Campaign_Member | null> {
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

  return data as Campaign_Member;
}

export async function updateCampaignMember(
  campaign_id: number,
  user_id: string,
  data: Pick<Campaign_Member, "role">,
): Promise<Campaign_Member | null> {
  const { data: insertedData, error } = await supabase
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

  return insertedData as Campaign_Member;
}

export async function deleteCampaignMember(
  campaign_id: number,
  user_id: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("campaign_members")
    .delete()
    .eq("campaign_id", campaign_id)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error deleting campaign member: ", error.message);
    return false;
  }

  return true;
}
