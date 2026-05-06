import { useQuery } from "@tanstack/react-query";
import { readApprovedCampaigns } from "@/src/actions/frontend/campaignsTable";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

// This hook is used for reading approved campaigns from an admin's perspective

export default function useReadApprovedCampaigns(competitionId?: number) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "approved-campaigns", competitionId],
    queryFn: async () => {
      const campaigns = await readApprovedCampaigns(competitionId);
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: competitionId !== undefined
  })
}
