import { useQuery } from "@tanstack/react-query";
import { readCampaignsUnderReview, type ReviewApplicationRow } from "@/src/actions/frontend/campaigns";

export default function useReadCampaignsNotApproved(competitionId: number) {
  return useQuery<ReviewApplicationRow[]>({
    queryKey: ["campaigns-under-review", competitionId],
    queryFn: async () => {
      return await readCampaignsUnderReview(competitionId);
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!competitionId,
  });
}
