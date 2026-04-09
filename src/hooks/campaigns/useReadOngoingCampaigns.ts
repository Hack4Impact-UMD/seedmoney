import { useQuery } from "@tanstack/react-query";
import { readOngoingChallengeApplications } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export type CampaignWithLeader = Campaign & {
  campaign_leader: string;
}

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