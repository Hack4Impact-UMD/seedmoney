import { WebhookPayload } from "./types";
import { createTransaction } from "@/src/actions/db/transactions";

export const transactionHandlers = {
  "transaction.succeeded": async (payload: WebhookPayload) => {
    if (!payload.data) return;
    const data = payload.data as {
      campaign_id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      donated: number;
      payout: number;
      status: string;
      transacted_at: string;
    };
    await createTransaction({
      campaign_id: data.campaign_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      amount_donated: data.donated,
      total_paid: data.payout,
      status: data.status,
      date: data.transacted_at,
    });
  },
};
