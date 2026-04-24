import { useQuery } from "@tanstack/react-query";
import { readPreviousChallengeApplications } from "@/src/actions/frontend/campaignsTable";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

export default function useReadPreviousChallengeApplications(user_id?: string) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "view-all", user_id],
    queryFn: async () => {
      const campaigns = await readPreviousChallengeApplications(user_id);
      if (!campaigns) return [];
      return campaigns as CampaignWithLeader[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: user_id !== undefined
  })
}
