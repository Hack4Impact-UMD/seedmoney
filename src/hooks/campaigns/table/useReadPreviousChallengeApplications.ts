import { useQuery } from "@tanstack/react-query";
import { readPreviousChallengeApplications } from "@/src/actions/frontend/campaignsTable";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

// This hook is used for reading previous challenge applications for a user

export default function useReadPreviousChallengeApplications(user_id?: string) {
  return useQuery<CampaignWithLeader[]>({
    queryKey: ["campaigns", "previous-challenges", user_id],
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