import { useQuery } from "@tanstack/react-query";
import { readCampaignsByCompId } from "@/src/actions/db/campaigns";
import type { Campaign } from "@/src/types/db/campaigns";

export default function useReadCampaignsByCompId(competitionId?: number) {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "read-by-comp-id", competitionId],
    queryFn: async () => {
      if (competitionId === undefined) {
        return [];
      }

      return await readCampaignsByCompId(competitionId);
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: competitionId !== undefined,
  });
}
