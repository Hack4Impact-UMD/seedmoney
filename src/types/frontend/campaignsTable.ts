import { Campaign } from "@/src/types/db/campaigns";

export type CampaignWithLeader = Campaign & {
  campaign_leader: string;
  campaign_leader_email: string;
};

export type ReviewApplicationRow = {
  campaignId: number;
  campaignTitle: string;
  campaignLeader: string;
  campaignLeaderEmail: string;
  raised: number;
  goal: number;
  goalProgress: number;
  status: "pending" | "denied";
  submissionDate: string;
};