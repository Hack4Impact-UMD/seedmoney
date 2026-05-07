import { useQuery } from "@tanstack/react-query";
import { readPreviousCampaigns } from "@/src/actions/frontend/campaignsTable";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

export default function useReadPreviousCampaigns(currentCompetitionId?: number) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "previous-campaigns", currentCompetitionId],
    queryFn: async () => {
      const campaigns = await readPreviousCampaigns(currentCompetitionId);
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: currentCompetitionId !== undefined,
  });
}
