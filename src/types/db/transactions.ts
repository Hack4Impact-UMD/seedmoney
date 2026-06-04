export type Transaction = {
  transaction_id: number;
  first_name: string;
  last_name: string;
  campaign_id: number;
  amount_donated: number;
  phone: string,
  email: string;
  date: string;
  total_paid: number;
  status: string;
}

export interface TransactionPayload {
  event: string;
  data?: {
    id: number | string;
    campaign_id: number;
    campaign_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    amount: number;
    payout: number;
    status: string;
    transacted_at: string;
  };
}
