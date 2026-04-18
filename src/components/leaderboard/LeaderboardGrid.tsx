import type { PublicLeaderboardCampaign } from "@/src/types/frontend/leaderboard";
import LeaderboardCard from "./LeaderboardCard";

type LeaderboardGridProps = {
  campaigns: PublicLeaderboardCampaign[];
};

export default function LeaderboardGrid({
  campaigns,
}: LeaderboardGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign, index) => (
        <LeaderboardCard
          key={campaign.campaignId}
          campaign={campaign}
          displayRank={index + 1}
        />
      ))}
    </div>
  );
}
