import { useQuery } from "@tanstack/react-query";
import { readTransactionsByCampaignIds } from "@/src/actions/db/transactions";
import type { LeaderboardGrantTransaction } from "@/src/lib/leaderboardGrantCalculations";

export default function useReadTransactionsByCampaignIds(
  campaignIds: number[],
  options?: { enabled?: boolean },
) {
  const sortedCampaignIds = [...campaignIds].sort((left, right) => left - right);

  return useQuery<LeaderboardGrantTransaction[]>({
    queryKey: ["transactions", "read-by-campaign-ids", sortedCampaignIds],
    queryFn: () => readTransactionsByCampaignIds(sortedCampaignIds),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: sortedCampaignIds.length > 0 && (options?.enabled ?? true),
  });
}
