import { useQuery } from "@tanstack/react-query";
import { readOngoingChallengeApplications } from "@/src/actions/db/campaigns";
import { CampaignWithLeader } from "@/src/types/frontend/campaigns";

export default function useReadOngoingCampaigns() {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "ongoing-challenges"],
    queryFn: async () => {
      const campaigns = await readOngoingChallengeApplications();
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  })
}