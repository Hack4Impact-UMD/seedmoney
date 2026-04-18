"use client";

import { useMemo, useState } from "react";
import type {
  LeaderboardSort,
  PublicLeaderboardData,
  PublicLeaderboardCampaignWithRank,
} from "@/src/types/frontend/leaderboard";
import LeaderboardHero from "./LeaderboardHero";
import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardGrid from "./LeaderboardGrid";
import LeaderboardEmptyState from "./LeaderboardEmptyState";
import type { LeaderboardGrantStat } from "./grantStatOptions";
import { grantStatOptions } from "./grantStatOptions";

type LeaderboardPageProps = {
  data: PublicLeaderboardData;
};

export default function LeaderboardPage({ data }: LeaderboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGarden, setSelectedGarden] = useState("all");
  const [selectedSort, setSelectedSort] =
    useState<LeaderboardSort>("mostRaised");
  const [selectedGrantStat, setSelectedGrantStat] =
    useState<LeaderboardGrantStat | null>(null);
  const [isGrantPanelOpen, setIsGrantPanelOpen] = useState(false);

  const rankedCampaigns = useMemo<PublicLeaderboardCampaignWithRank[]>(
    () =>
      [...data.campaigns]
        .sort((left, right) => right.raised - left.raised)
        .map((campaign, index) => ({
          ...campaign,
          displayRank: index + 1,
        })),
    [data.campaigns],
  );

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const selectedGrantOption = grantStatOptions.find(
      (grantOption) => grantOption.id === selectedGrantStat,
    );

    const visibleCampaigns = rankedCampaigns.filter((campaign) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        campaign.name.toLowerCase().includes(normalizedSearch);
      const matchesGarden =
        selectedGarden === "all" ||
        campaign.projectCategory === selectedGarden;
      const matchesGrantStat =
        selectedGrantOption === undefined ||
        (campaign.displayRank >= selectedGrantOption.minRank &&
          campaign.displayRank <= selectedGrantOption.maxRank);

      return matchesSearch && matchesGarden && matchesGrantStat;
    });

    return [...visibleCampaigns].sort((left, right) => {
      if (selectedSort === "leastRaised") {
        return left.raised - right.raised;
      }

      if (selectedSort === "mostDonors") {
        return right.donors - left.donors;
      }

      return right.raised - left.raised;
    });
  }, [
    rankedCampaigns,
    searchQuery,
    selectedGarden,
    selectedGrantStat,
    selectedSort,
  ]);

  const handleSortChange = (value: LeaderboardSort) => {
    setSelectedSort(value);
  };

  const handleGrantChipClick = () => {
    if (isGrantPanelOpen) {
      setIsGrantPanelOpen(false);
      setSelectedGrantStat(null);
      return;
    }

    setIsGrantPanelOpen(true);
  };

  const handleGrantSelect = (value: LeaderboardGrantStat) => {
    setSelectedGrantStat(value);
    setIsGrantPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      <LeaderboardHero
        challengeTitle={data.challengeTitle}
        totalCampaigns={data.totalCampaigns}
        totalRaised={data.totalRaised}
        totalDonors={data.totalDonors}
      />

      {data.campaigns.length > 0 && (
        <LeaderboardFilters
          gardenCategories={data.gardenCategories}
          searchQuery={searchQuery}
          selectedGarden={selectedGarden}
          selectedSort={selectedSort}
          selectedGrantStat={selectedGrantStat}
          isGrantPanelOpen={isGrantPanelOpen}
          onSearchChange={setSearchQuery}
          onGardenChange={setSelectedGarden}
          onSortChange={handleSortChange}
          onGrantChipClick={handleGrantChipClick}
          onGrantSelect={handleGrantSelect}
        />
      )}

      <main className="px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1728px]">
          {data.campaigns.length === 0 ? (
            <LeaderboardEmptyState
              title="No public campaigns yet"
              description="Once published campaigns are available for the current SeedMoney Challenge, they will appear here."
            />
          ) : filteredCampaigns.length === 0 ? (
            <LeaderboardEmptyState
              title="No campaigns match your filters"
              description="Try a different search term or garden category to see more campaigns."
            />
          ) : (
            <LeaderboardGrid campaigns={filteredCampaigns} />
          )}
        </div>
      </main>
    </div>
  );
}
