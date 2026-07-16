import { TransactionPayload } from "./types";
import { createTransaction } from "@/src/actions/db/transactions";
import { createServiceRoleClient } from "@/src/lib/supabase-service";

type GivebutterTransaction = {
  id: string | null;
  campaign_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  amount: number;
  payout: number;
  status: string | null;
  transacted_at: string;
};

const succeededStatuses = new Set([
  "succeeded",
  "paid",
  "complete",
  "completed",
]);

async function readGivebutterTransaction(transactionId: number | string) {
  const apiKey = process.env.GIVEBUTTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GIVEBUTTER_API_KEY");
  }

  const response = await fetch(
    `https://api.givebutter.com/v1/transactions/${encodeURIComponent(String(transactionId))}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Givebutter transaction verification failed (${response.status})`,
    );
  }

  return (await response.json()) as GivebutterTransaction;
}

export const transactionHandlers = {
  "transaction.succeeded": async (payload: TransactionPayload) => {
    if (!payload.data) return;

    const data = await readGivebutterTransaction(payload.data.id);
    if (
      !data.id ||
      !data.campaign_id ||
      !data.status ||
      !succeededStatuses.has(data.status.toLowerCase())
    ) {
      throw new Error(`Invalid succeeded transaction ${payload.data.id}`);
    }

    const supabase = createServiceRoleClient();
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("campaign_id, competition_id, raised")
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

    const { data: existingTransaction, error: existingTransactionError } =
      await supabase
        .from("transactions")
        .select("transaction_id")
        .eq("givebutter_id", data.id)
        .maybeSingle();

    if (existingTransactionError) {
      throw new Error(existingTransactionError.message);
    }

    if (existingTransaction) {
      return;
    }

    let campaignEndDate = "";

    if (campaign.competition_id) {
      const { data: competition, error: competitionError } = await supabase
        .from("competition_metadata")
        .select("end_date")
        .eq("competition_id", campaign.competition_id)
        .maybeSingle();

      if (competitionError) {
        throw new Error(competitionError.message);
      }

      campaignEndDate = competition?.end_date ?? "";
    }

    const transaction = await createTransaction(
      {
        givebutter_id: data.id,
        campaign_id: campaign.campaign_id,
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        amount_donated: data.amount,
        total_paid: data.payout,
        status: "succeeded",
        date: data.transacted_at,
        transacted_at: data.transacted_at,
      },
      supabase,
    );

    if (!transaction) {
      throw new Error(`Failed to save transaction ${data.id}`);
    }

    try {
      const { error: emailError } = await supabase.functions.invoke(
        "send-campaign-email",
        {
          body: {
            type: "donation_received",
            campaign_id: campaign.campaign_id,
            donation: {
              donation_amount: data.amount,
              donor_first_name: data.first_name ?? "",
              donor_last_name: data.last_name ?? "",
              total_raised: Number(campaign.raised ?? 0) + data.amount,
              campaign_end_date: campaignEndDate,
            },
          },
        },
      );

      if (emailError) {
        console.error(
          `Error sending donation received email for campaign ${campaign.campaign_id}:`,
          emailError.message,
        );
      }
    } catch (emailError) {
      console.error(
        `Error sending donation received email for campaign ${campaign.campaign_id}:`,
        emailError,
      );
    }
  },
};
