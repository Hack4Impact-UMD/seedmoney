import { TransactionPayload } from "./types";
import { createTransaction } from "@/src/actions/db/transactions";

export const transactionHandlers = {
  "transaction.succeeded": async (payload: TransactionPayload) => {
    if (!payload.data) return;
    const data = payload.data;
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
