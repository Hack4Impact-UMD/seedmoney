import type { Transaction } from "@/src/types/db/transactions";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { updateCampaign, readCampaign } from "@/src/actions/db/campaigns";

export async function readTransactionsByCampaign(
  campaignId: number,
): Promise<Transaction[] | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error reading transactions:", error.message);
    return null;
  }

  return data as Transaction[];
}

export async function createTransaction(
  data: Partial<Transaction>,
): Promise<Transaction | null> {
  const supabase = createBrowserClient();

  const { data: insertedData, error } = await supabase
    .from("transactions")
    .insert(data)
    .select()
    .single();

  if (error || !insertedData) {
    console.error("Error creating transaction:", error?.message);
    return null;
  }

  // Only update if succeeded
  if (insertedData.status === "succeeded") {
    const campaign = await readCampaign(insertedData.campaign_id);
    if (campaign && !Array.isArray(campaign)) {
      await updateCampaign(insertedData.campaign_id, {
        raised: campaign.raised + insertedData.amount_donated,
        donors: campaign.donors + 1
      });
    }
  }

  return insertedData as Transaction;
}