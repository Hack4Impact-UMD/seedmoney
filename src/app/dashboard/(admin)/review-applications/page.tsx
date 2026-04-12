"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadCampaignsNotApproved from "@/src/hooks/campaigns/useReadCampaignsNotApproved";

export default function ReviewApplicationsPage() {
  const { data: competition } = useReadCurrentCompetition();
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useReadCampaignsNotApproved(competition?.competition_id ?? 0);

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar/>

      <main className="flex-1 px-6 py-8 sm:px-10 md:px-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-gray-600">Loading applications...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-red-600">Error loading applications. Please try again.</p>
          </div>
        ) : (
          <ReviewApplicationsTable applications={applications} />
        )}
      </main>
    </div>
  );
}
