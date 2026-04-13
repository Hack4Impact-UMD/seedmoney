import { Campaign } from "@/src/types/db/campaigns";

export type CampaignWithLeader = Campaign & {
  campaign_leader: string;
}

export type ReviewApplicationRow = {
  campaignId: number;
  campaignTitle: string;
  campaignLeader: string;
  raised: number;
  goal: number;
  goalProgress: number;
  status: "submitted_under_review" | "not_approved";
  submissionDate: string;
};
