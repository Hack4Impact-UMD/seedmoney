import { Campaign } from "@/src/types/db/campaigns";

export type CampaignWithLeader = Campaign & {
  campaign_leader: string;
}