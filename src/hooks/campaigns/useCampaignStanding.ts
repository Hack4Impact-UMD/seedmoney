import { useMemo } from "react";
import useReadCampaignsByCompId from "./useReadCampaignsByCompId";
import { getCampaignRank } from "@/src/lib/leaderboardRanking";

export default function useCampaignStanding(
  campaignId?: number,
  competitionId?: number | null,
) {
  const query = useReadCampaignsByCompId(competitionId ?? undefined);
  const standing = useMemo(() => {
    if (!query.data || !campaignId) return null;
    const published = query.data
      .filter((c) => c.status === "published")
      .map((c) => ({
        campaignId: c.campaign_id,
        raised: c.raised ?? 0,
        donors: c.donors ?? 0,
      }));

    return {
      rank: getCampaignRank(published, campaignId),
      totalProjects: published.length,
    };
  }, [query.data, campaignId]);
  return { ...query, data: standing };
}
