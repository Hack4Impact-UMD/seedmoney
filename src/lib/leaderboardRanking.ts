import type { CampaignWithStanding } from "@/src/types/db/competitionStandings";

type RankableCampaign = {
  campaignId: number;
  raised: number;
  donors: number;
};

export function getCampaignRankingInputs(
  campaign: CampaignWithStanding,
): RankableCampaign {
  return {
    campaignId: campaign.campaign_id,
    raised: Number(campaign.competitionStanding?.raised ?? 0),
    donors: Number(campaign.competitionStanding?.donation_count ?? 0),
  };
}

export function compareCampaignsForRank(
  left: RankableCampaign,
  right: RankableCampaign,
) {
  return (
    right.raised - left.raised ||
    right.donors - left.donors ||
    left.campaignId - right.campaignId
  );
}

export function rankCampaigns<T extends RankableCampaign>(campaigns: T[]) {
  return [...campaigns]
    .sort(compareCampaignsForRank)
    .map((campaign, index) => ({
      ...campaign,
      displayRank: index + 1,
    }));
}

export function getCampaignRank<T extends RankableCampaign>(
  campaigns: T[],
  campaignId: number,
): number | null {
  return (
    rankCampaigns(campaigns).find((c) => c.campaignId === campaignId)
      ?.displayRank ?? null
  );
}
