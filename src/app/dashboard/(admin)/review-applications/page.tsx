"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadCampaignsNotApproved from "@/src/hooks/campaigns/useReadCampaignsNotApproved";

export default function ReviewApplicationsPage() {
  const { data: competition } = useReadCurrentCompetition();
  const {
    data: applications = [],
    isFetching,
    refetch,
  } = useReadCampaignsNotApproved(competition?.competition_id ?? 0);

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />

      <main className="flex-1 px-6 py-8 sm:px-10 md:px-12">
        <ReviewApplicationsTable
          applications={applications}
          isLoading={isFetching}
          onRefetch={refetch}
        />
      </main>
    </div>
  );
}
