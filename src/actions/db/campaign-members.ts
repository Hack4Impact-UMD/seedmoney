import { CampaignMember } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";

const supabase = await createServerClient();

export async function createCampaignMember(
  data: CampaignMember,
): Promise<CampaignMember | null> {
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

  return insertedData as CampaignMember;
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
