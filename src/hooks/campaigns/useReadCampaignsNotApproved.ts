import { useQuery } from "@tanstack/react-query";
import { readCampaignsUnderReview } from "@/src/actions/db/campaigns";
import type { ReviewApplicationRow } from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";

export default function useReadCampaignsNotApproved(competitionId: number) {
  return useQuery<ReviewApplicationRow[]>({
    queryKey: ["campaigns-under-review", competitionId],
    queryFn: async () => {
      const campaigns = await readCampaignsUnderReview(competitionId);
      return campaigns.map((c) => ({
        campaignId: c.campaign_id,
        campaignTitle: c.name,
        campaignLeader: c.leader_name,
        raised: c.raised,
        goal: c.goal,
        goalProgress:
          c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0,
        status: c.status as "submitted_under_review" | "not_approved",
        submissionDate: c.date_created,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!competitionId,
  });
}
