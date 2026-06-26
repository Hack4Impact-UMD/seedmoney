"use client";

import { useMemo } from "react";
import { Open_Sans } from "next/font/google";
import LeaderboardPage from "@/src/components/leaderboard/LeaderboardPage";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadCampaignsByCompId from "@/src/hooks/campaigns/useReadCampaignsByCompId";
import useReadCampaignImageUrlsByCampaignIds from "@/src/hooks/campaign-image-records/useReadCampaignImageUrlsByCampaignIds";
import useReadTransactionsByCampaignIds from "@/src/hooks/transactions/useReadTransactionsByCampaignIds";
import { calculateSpecialGrantCampaignIds } from "@/src/lib/leaderboardGrantCalculations";
import type { Campaign } from "@/src/types/db/campaigns";
import type { SpecialGrantCampaignIds } from "@/src/lib/leaderboardGrantCalculations";
import { leaderboardGardenCategories } from "@/src/constants/gardenCategories";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "700", "800"],
});

function mapCampaignsToLeaderboardData(
  campaigns: Campaign[],
  challengeTitle: string,
  imageUrlsByCampaignId: Record<number, string | null>,
  specialGrantCampaignIds: SpecialGrantCampaignIds,
) {
  const publicCampaigns = campaigns.map((campaign) => {
    const raised =
      typeof campaign.raised === "number" ? campaign.raised : 0;
    const goal = typeof campaign.goal === "number" ? campaign.goal : 0;
    const donors =
      typeof campaign.donors === "number" ? campaign.donors : 0;
    const locationParts = [campaign.city, campaign.state].filter(
      (value): value is string => typeof value === "string" && value.trim() !== "",
    );
    const location =
      locationParts.length > 0 ? locationParts.join(", ") : "Unknown location";

    return {
      campaignId: campaign.campaign_id,
      name: campaign.name,
      location,
      raised,
      goal,
      donors,
      projectCategory: campaign.project_category,
      donateUrl: campaign.givebutterlink,
      summary: campaign.organization_name || "",
      imageUrl: imageUrlsByCampaignId[campaign.campaign_id] ?? null,
    };
  });

  return {
    challengeTitle,
    totalCampaigns: publicCampaigns.length,
    totalRaised: publicCampaigns.reduce(
      (sum, campaign) => sum + campaign.raised,
      0,
    ),
    totalDonors: publicCampaigns.reduce(
      (sum, campaign) => sum + campaign.donors,
      0,
    ),
    gardenCategories: [...leaderboardGardenCategories],
    campaigns: publicCampaigns,
    specialGrantCampaignIds,
  };
}

export default function PublicLeaderboardPage() {
  const { data: currentCompetitionData, isLoading: isLoadingCompetition } =
    useReadCurrentCompetition();
  const competitionId = currentCompetitionData?.competition_id;
  const challengeYear = currentCompetitionData?.start_date
    ? new Date(currentCompetitionData.start_date).getFullYear()
    : null;
  const challengeTitle =
    challengeYear === null
      ? "The SeedMoney Challenge"
      : `The ${challengeYear} SeedMoney Challenge`;
  const {
    data: campaignsData = [],
    isLoading: isLoadingCampaigns,
    error,
  } = useReadCampaignsByCompId(competitionId);
  const campaignIds = campaignsData.map((campaign) => campaign.campaign_id);
  const {
    data: imageUrlsByCampaignId = {},
    isLoading: isLoadingImages,
  } = useReadCampaignImageUrlsByCampaignIds(campaignIds);
  const {
    data: transactionsData = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useReadTransactionsByCampaignIds(campaignIds);
  const specialGrantCampaignIds = useMemo(
    () =>
      calculateSpecialGrantCampaignIds({
        campaigns: campaignsData,
        transactions: transactionsData,
        competitionStartDate: currentCompetitionData?.start_date,
        competitionEndDate: currentCompetitionData?.end_date,
      }),
    [
      campaignsData,
      currentCompetitionData?.end_date,
      currentCompetitionData?.start_date,
      transactionsData,
    ],
  );

  if (
    isLoadingCompetition ||
    isLoadingCampaigns ||
    isLoadingImages ||
    isLoadingTransactions
  ) return null;
  if (error || transactionsError) return null;

  const leaderboardData = mapCampaignsToLeaderboardData(
    campaignsData,
    challengeTitle,
    imageUrlsByCampaignId,
    specialGrantCampaignIds,
  );

  return (
    <div
      className={`${openSans.variable} min-h-screen bg-[#F6F4EE]`}
      style={{ fontFamily: "var(--font-open-sans), sans-serif" }}
    >
      <LeaderboardPage data={leaderboardData} />
    </div>
  );
}
