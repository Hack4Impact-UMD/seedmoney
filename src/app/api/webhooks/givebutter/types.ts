
import { TransactionPayload } from "@/src/types/db/transactions";

export interface GivebuttercampaignPayload {
  event: string;
  data?: {
    id: number;
    code?: string;
    slug: string;
    title: string;
    url: string;
    raised: number;
    donors: number;
    goal: number;
    created_at: string;
  };
}

export type WebhookPayload = GivebuttercampaignPayload | TransactionPayload;

export type { TransactionPayload };
