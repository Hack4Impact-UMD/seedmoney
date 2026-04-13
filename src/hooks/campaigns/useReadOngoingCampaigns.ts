import { useQuery } from "@tanstack/react-query";
import { readOngoingChallengeApplications } from "@/src/actions/frontend/campaigns";
import { CampaignWithLeader } from "@/src/types/frontend/campaigns";

export default function useReadOngoingCampaigns(competitionId?: number) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "ongoing-challenges", competitionId],
    queryFn: async () => {
      if (competitionId === undefined) return [];
      const campaigns = await readOngoingChallengeApplications(competitionId);
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: competitionId !== undefined
  })
}