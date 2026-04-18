export type LeaderboardSort =
  | "mostRaised"
  | "leastRaised"
  | "mostDonors"
  | "grantStat";

export type PublicLeaderboardCampaign = {
  campaignId: number;
  name: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  projectCategory: string;
  donateUrl: string;
  summary: string;
  imageUrl: string | null;
};

export type PublicLeaderboardData = {
  challengeTitle: string;
  totalCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  gardenCategories: string[];
  campaigns: PublicLeaderboardCampaign[];
};
