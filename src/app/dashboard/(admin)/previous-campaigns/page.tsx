"use client";

import Navbar from "@/src/components/Navbar";
import CampaignsTable from "@/src/components/CampaignsTable";
import Loading from "@/src/app/loading";
import Error from "@/src/app/error";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadPreviousCampaigns from "@/src/hooks/campaigns/table/useReadPreviousCampaigns";
import type { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";

function getPreviousCampaignPath(campaign: CampaignWithLeader) {
  switch (campaign.status) {
    case "pending":
    case "denied":
      return `/dashboard/review-applications/${campaign.campaign_id}`;
    case "approved":
    case "published":
    case "publish_failed":
    case "archived":
      return `/dashboard/approved-campaigns/${campaign.campaign_id}`;
    default:
      return `/dashboard/approved-campaigns/${campaign.campaign_id}`;
  }
}

export default function PreviousCampaignsPage() {
  const {
    data: currentCompetition,
    isLoading: isLoadingCompetition,
    error: competitionError,
    refetch: refetchCompetition,
  } = useReadCurrentCompetition();
  const {
    data: campaigns,
    isLoading,
    error,
    refetch,
  } = useReadPreviousCampaigns(currentCompetition?.competition_id);

  if (isLoadingCompetition || isLoading) return <Loading />;

  if (competitionError)
    return <Error error={competitionError} reset={() => refetchCompetition()} />;

  if (!currentCompetition)
    return (
      <Error
        error={{ name: "Not found", message: "Competition not found" }}
        reset={() => refetchCompetition()}
      />
    );

  if (error) return <Error error={error} reset={() => refetch()} />;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-[#F6FAF9] px-4 py-8 pb-24 md:px-10 md:py-[60px] md:pb-[60px]">
        <div className="flex w-full flex-col gap-6">
          <div className="hidden w-full md:block">
            <h1 className="text-4xl font-bold text-[#123A1E]">Previous Campaigns</h1>
          </div>

          <CampaignsTable
            initialData={campaigns || []}
            pageTitle="Previous Campaigns"
            pageListLabel="Previous Campaigns List"
            useFilterMenu
            adminRouteResolver={getPreviousCampaignPath}
          />
        </div>
      </div>
    </div>
  );
}
