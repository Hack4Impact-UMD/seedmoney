import { useQuery } from "@tanstack/react-query";
import { readOngoingCampaigns } from "@/src/actions/frontend/campaignsTable";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

// This hook is used for reading ongoing campaigns from an admin's perspective

export default function useReadOngoingCampaigns(competitionId?: number) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "ongoing-challenges", competitionId],
    queryFn: async () => {
      const campaigns = await readOngoingCampaigns(competitionId);
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: competitionId !== undefined
  })
}