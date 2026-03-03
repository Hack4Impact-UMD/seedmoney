import type { Campaign, NewCampaign } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";

const supabase = await createServerClient();

export async function createCampaign(
  data: NewCampaign,
): Promise<Campaign | null> {
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

export async function updateCampaign(id: number, data: Partial<NewCampaign>) {
  const { error } = await supabase
    .from("campaigns")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Error updating campaign:", error.message);
    return;
  }
}

export async function deleteCampaign(id: number) {
  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("campaign_id", id);

  if (error) {
    console.error("Error deleting campaign:", error.message);
    return;
  }

}
