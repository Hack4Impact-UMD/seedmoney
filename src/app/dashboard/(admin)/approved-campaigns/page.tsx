"use client";
import Navbar from "@/src/components/Navbar";
import CampaignsTable from "@/src/components/CampaignsTable";
import Loading from "@/src/app/loading";
import Error from "@/src/app/error";

import useReadApprovedCampaigns from "@/src/hooks/campaigns/table/useReadApprovedCampaigns";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import type { Status } from "@/src/types/db/enums";

const approvedCampaignStatusOptions: Status[] = [
  "approved",
  "published",
  "publish_failed",
];

const approvedCampaignStatusPriority: Status[] = [
  "publish_failed",
  "published",
  "approved",
];

export default function ApprovedCampaignsPage() {
  const {
    data: currentCompetition,
    isLoading: isLoadingCompetition,
    error: competitionError,
  } = useReadCurrentCompetition();
  const {
    data: campaigns,
    isLoading,
    error,
    refetch,
  } = useReadApprovedCampaigns(currentCompetition?.competition_id);

  if (isLoadingCompetition || isLoading) return <Loading />;

  if (competitionError)
    return <Error error={competitionError} reset={() => {}} />;

  if (!currentCompetition)
    return (
      <Error
        error={{ name: "Not found", message: "Competition not found" }}
        reset={() => {}}
      />
    );

  if (error) return <Error error={error} reset={() => refetch()} />;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 p-4 pb-24 md:p-10 md:pb-10">
        <h3 className="mb-5 hidden text-4xl font-bold text-[#096B2E] md:block">
          Approved Campaigns
        </h3>
        <CampaignsTable
          initialData={campaigns || []}
          pageTitle="Approved Campaigns"
          pageListLabel="Full Campaign List"
          desktopFilterMode="status"
          statusOptionsOverride={approvedCampaignStatusOptions}
          statusSortPriority={approvedCampaignStatusPriority}
          desktopSearchPlaceholder="Campaign Title, Campaign Leader, etc..."
          showDesktopResetButton={false}
          hideYearColumn
          statusColumnLabel="Website Status"
        />
      </div>
    </div>
  );
}
