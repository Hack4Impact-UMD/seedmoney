import type { Campaign } from "./campaigns";

export type CompetitionStanding = {
  competition_id: number;
  campaign_id: number;
  raised: number;
  donation_count: number;
};

export type CampaignWithStanding = Campaign & {
  competitionStanding: CompetitionStanding | null;
};
