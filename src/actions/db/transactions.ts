import type { Transaction } from "@/src/types/db/transactions";
import { createBrowserClient } from "@/src/lib/supabase-client";

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
