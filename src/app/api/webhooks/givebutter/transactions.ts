import { TransactionPayload } from "./types";
import { createWebhookSupabaseClient } from "@/src/lib/supabase-service-role";

export const transactionHandlers = {
  "transaction.succeeded": async (payload: TransactionPayload) => {
    if (!payload.data) return;
    const data = payload.data;
    const supabase = createWebhookSupabaseClient();
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("campaign_id")
      .eq("givebutter_id", String(data.campaign_id))
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!campaign) {
      throw new Error(
        `Campaign not found for Givebutter id ${data.campaign_id}`,
      );
    }

    const { data: insertedTransaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        campaign_id: campaign.campaign_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        amount_donated: data.donated,
        total_paid: data.payout,
        status: data.status,
        date: data.transacted_at,
      })
      .select("campaign_id, amount_donated, status")
      .single();

    if (transactionError || !insertedTransaction) {
      throw new Error(transactionError?.message ?? "Error creating transaction");
    }

    if (insertedTransaction.status !== "succeeded") {
      return;
    }

    const { data: campaignTotals, error: totalsError } = await supabase
      .from("campaigns")
      .select("raised, donors")
      .eq("campaign_id", insertedTransaction.campaign_id)
      .maybeSingle();

    if (totalsError) {
      throw new Error(totalsError.message);
    }

    if (!campaignTotals) {
      return;
    }

    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        raised:
          (campaignTotals.raised ?? 0) + insertedTransaction.amount_donated,
        donors: (campaignTotals.donors ?? 0) + 1,
      })
      .eq("campaign_id", insertedTransaction.campaign_id);

    if (updateError) {
      console.error("Error updating campaign totals:", updateError.message);
    }
  },
};
