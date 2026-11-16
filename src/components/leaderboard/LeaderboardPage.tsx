"use client";

import { useMemo, useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
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
import { compareCampaignsForRank } from "@/src/lib/leaderboardRanking";
import useReadCampaignImageUrlsByCampaignIds from "@/src/hooks/campaign-image-records/useReadCampaignImageUrlsByCampaignIds";

const PAGE_SIZE = 12;

type LeaderboardPageProps = {
  data: PublicLeaderboardData;
};

function isSpecialGrantStat(
  value: LeaderboardGrantStat | null,
): value is keyof PublicLeaderboardData["specialGrantCampaignIds"] {
  return (
    value === "strongStart" ||
    value === "strongFinish" ||
    value === "geographicInterest"
  );
}

export default function LeaderboardPage({ data }: LeaderboardPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGarden, setSelectedGarden] = useState("all");
  const [selectedSort, setSelectedSort] =
    useState<LeaderboardSort>("mostRaised");
  const [selectedGrantStat, setSelectedGrantStat] =
    useState<LeaderboardGrantStat | null>(null);
  const [isGrantPanelOpen, setIsGrantPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const rankedCampaigns = useMemo<PublicLeaderboardCampaignWithRank[]>(
    () =>
      [...data.campaigns]
        .sort(compareCampaignsForRank)
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
    const selectedSpecialGrantCampaignIds = isSpecialGrantStat(
      selectedGrantStat,
    )
      ? data.specialGrantCampaignIds[selectedGrantStat]
      : undefined;

    const visibleCampaigns = rankedCampaigns.filter((campaign) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        campaign.name.toLowerCase().includes(normalizedSearch);
      const matchesGarden =
        selectedGarden === "all" || campaign.projectCategory === selectedGarden;
      const matchesGrantStat =
        selectedGrantOption === undefined ||
        (selectedGrantOption.minRank !== undefined &&
          selectedGrantOption.maxRank !== undefined &&
          campaign.displayRank >= selectedGrantOption.minRank &&
          campaign.displayRank <= selectedGrantOption.maxRank) ||
        (Array.isArray(selectedSpecialGrantCampaignIds) &&
          selectedSpecialGrantCampaignIds.includes(campaign.campaignId));

      return matchesSearch && matchesGarden && matchesGrantStat;
    });

    return [...visibleCampaigns].sort((left, right) => {
      if (selectedSort === "leastRaised") {
        return right.displayRank - left.displayRank;
      }

      if (selectedSort === "mostDonors") {
        return right.donors - left.donors;
      }

      return left.displayRank - right.displayRank;
    });
  }, [
    data.specialGrantCampaignIds,
    rankedCampaigns,
    searchQuery,
    selectedGarden,
    selectedGrantStat,
    selectedSort,
  ]);
  const pageCount = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const { data: imageUrls = {} } = useReadCampaignImageUrlsByCampaignIds(
    pageCampaigns.map((campaign) => campaign.campaignId),
  );
  const visibleCampaigns = pageCampaigns.map((campaign) => ({
    ...campaign,
    imageUrl: imageUrls[campaign.campaignId] ?? campaign.imageUrl,
  }));
  const isSelectedGrantPending =
    isSpecialGrantStat(selectedGrantStat) &&
    data.specialGrantCampaignIds[selectedGrantStat] === null;
  const emptyStateTitle = isSelectedGrantPending
    ? "Grant standings not available yet"
    : "No campaigns match your filters";
  const emptyStateDescription =
    selectedGrantStat === "strongStart"
      ? "Strong Start standings will appear after the first 7 days of the challenge are complete."
      : selectedGrantStat === "strongFinish"
        ? "Strong Finish standings will appear after the final 7 days of the challenge are complete."
        : "Try a different search term, garden category, or grant filter to see more campaigns.";

  const handleSortChange = (value: LeaderboardSort) => {
    setPage(1);
    setSelectedSort(value);
  };

  const handleGrantChipClick = () => {
    if (isGrantPanelOpen) {
      setIsGrantPanelOpen(false);
      setSelectedGrantStat(null);
      setPage(1);
      return;
    }

    setIsGrantPanelOpen(true);
  };

  const handleGrantSelect = (value: LeaderboardGrantStat) => {
    setPage(1);
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
          onSearchChange={(value) => { setSearchQuery(value); setPage(1); }}
          onGardenChange={(value) => { setSelectedGarden(value); setPage(1); }}
          onSortChange={handleSortChange}
          onGrantChipClick={handleGrantChipClick}
          onGrantSelect={handleGrantSelect}
        />
      )}

      <main className="px-6 py-8 md:px-10 lg:px-16">
        <div ref={resultsRef} className="mx-auto max-w-[1728px]">
          {data.campaigns.length === 0 ? (
            <LeaderboardEmptyState
              title="No public campaigns yet"
              description="Once published campaigns are available for the current SeedMoney Challenge, they will appear here."
            />
          ) : filteredCampaigns.length === 0 ? (
            <LeaderboardEmptyState
              title={emptyStateTitle}
              description={emptyStateDescription}
            />
          ) : (
            <>
              <LeaderboardGrid campaigns={visibleCampaigns} />
              {pageCount > 1 && (
                <Pagination
                  className="mt-8 flex justify-center"
                  count={pageCount}
                  page={currentPage}
                  siblingCount={0}
                  color="primary"
                  onChange={(_, value) => {
                    setPage(value);
                    resultsRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
