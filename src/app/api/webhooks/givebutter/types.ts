
import { GivebutterCampaignPayload } from "@/src/types/db/campaigns";
export interface WebhookPayload {
  event: string;
  data?: GivebutterCampaignPayload;
}