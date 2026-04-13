import { useQuery } from "@tanstack/react-query";
import { readCampaignsUnderReview } from "@/src/actions/frontend/campaignsReviewTable";
import { ReviewApplicationRow } from "@/src/types/frontend/campaignsTable";

export default function useReadCampaignsNotApproved(competitionId?: number) {
  return useQuery<ReviewApplicationRow[]>({
    queryKey: ["campaigns","campaigns-under-review", competitionId],
    queryFn: async () => {
      const campaigns = await readCampaignsUnderReview(competitionId);
      if (!campaigns) return [];
      return campaigns as ReviewApplicationRow[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: competitionId !== undefined,
  });
}
