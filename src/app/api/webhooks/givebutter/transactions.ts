import { TransactionPayload } from "./types";
import { createTransaction } from "@/src/actions/db/transactions";
import { createBrowserClient } from "@/src/lib/supabase-client";

export const transactionHandlers = {
  "transaction.succeeded": async (payload: TransactionPayload) => {
    if (!payload.data) return;
    const data = payload.data;
    const supabase = createBrowserClient();
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("campaign_id")
      .eq("givebutter_id", data.campaign_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!campaign) {
      throw new Error(
        `Campaign not found for Givebutter code ${data.campaign_id}`,
      );
    }

    await createTransaction({
      campaign_id: campaign.campaign_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      amount_donated: data.amount,
      total_paid: data.payout,
      status: data.status,
      date: data.transacted_at,
    });
  },
};
