import type { Transaction } from "@/src/types/db/transactions";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@/src/lib/supabase-client";
import type { LeaderboardGrantTransaction } from "@/src/lib/leaderboardGrantCalculations";

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

export async function readTransactionsByCampaignIds(
  campaignIds: number[],
): Promise<LeaderboardGrantTransaction[]> {
  if (campaignIds.length === 0) {
    return [];
  }

  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("leaderboard_transactions")
    .select("campaign_id, date, transacted_at, amount_donated, status")
    .in("campaign_id", campaignIds)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error reading transactions by campaign ids:", error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as LeaderboardGrantTransaction[];
}

export async function createTransaction(
  data: Partial<Transaction>,
  client?: SupabaseClient,
): Promise<Transaction | null> {
  const supabase = client ?? createBrowserClient();

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
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("raised, donors")
      .eq("campaign_id", insertedData.campaign_id)
      .maybeSingle();

    if (campaignError) {
      console.error("Error reading campaign:", campaignError.message);
    } else if (campaign) {
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          raised:
            Number(campaign.raised ?? 0) + insertedData.amount_donated,
          donors: Number(campaign.donors ?? 0) + 1,
        })
        .eq("campaign_id", insertedData.campaign_id);

      if (updateError) {
        console.error("Error updating campaign:", updateError.message);
      }
    }
  }

  return insertedData as Transaction;
}
