import { useMemo } from "react";
import useReadCampaignsByCompId from "./useReadCampaignsByCompId";
import {
  getCampaignRank,
  getCampaignRankingInputs,
} from "@/src/lib/leaderboardRanking";

export default function useCampaignStanding(
  campaignId?: number,
  competitionId?: number | null,
) {
  const query = useReadCampaignsByCompId(competitionId ?? undefined);
  const standing = useMemo(() => {
    if (!query.data || !campaignId) return null;
    const published = query.data
      .filter((c) => c.status === "published")
      .map(getCampaignRankingInputs);

    return {
      rank: getCampaignRank(published, campaignId),
      totalProjects: published.length,
    };
  }, [query.data, campaignId]);
  return { ...query, data: standing };
}
