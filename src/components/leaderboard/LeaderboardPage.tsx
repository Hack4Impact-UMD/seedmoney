"use client";

import { useMemo, useState } from "react";
import type {
  LeaderboardSort,
  PublicLeaderboardData,
} from "@/src/types/frontend/leaderboard";
import LeaderboardHero from "./LeaderboardHero";
import LeaderboardFilters from "./LeaderboardFilters";
import LeaderboardGrid from "./LeaderboardGrid";
import LeaderboardEmptyState from "./LeaderboardEmptyState";

type LeaderboardPageProps = {
  data: PublicLeaderboardData;
};

export default function LeaderboardPage({ data }: LeaderboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGarden, setSelectedGarden] = useState("all");
  const [selectedSort, setSelectedSort] =
    useState<LeaderboardSort>("mostRaised");

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const visibleCampaigns = data.campaigns.filter((campaign) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        campaign.name.toLowerCase().includes(normalizedSearch);
      const matchesGarden =
        selectedGarden === "all" ||
        campaign.projectCategory === selectedGarden;

      return matchesSearch && matchesGarden;
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
  }, [data.campaigns, searchQuery, selectedGarden, selectedSort]);

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
          onSearchChange={setSearchQuery}
          onGardenChange={setSelectedGarden}
          onSortChange={setSelectedSort}
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
