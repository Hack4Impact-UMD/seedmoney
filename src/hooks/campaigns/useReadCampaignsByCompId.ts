import { useQuery } from "@tanstack/react-query";
import { readCampaignsByCompId } from "@/src/actions/db/campaigns";
import type { CampaignWithStanding } from "@/src/types/db/competitionStandings";

export default function useReadCampaignsByCompId(competitionId?: number) {
  return useQuery<CampaignWithStanding[]>({
    queryKey: ["campaigns", "read-by-comp-id", competitionId],
    queryFn: async () => {
      if (competitionId === undefined) {
        return [];
      }

      return await readCampaignsByCompId(competitionId);
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    retry: 2,
    enabled: competitionId !== undefined,
  });
}
