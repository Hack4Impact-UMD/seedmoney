"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import Loading from "@/src/app/loading";
import Error from "@/src/app/error";
import useReadCampaignsNotApproved from "@/src/hooks/campaigns/table/useReadCampaignsNotApproved";

export default function ReviewApplicationsPage() {
  const { data: currentCompetition, isLoading: isLoadingCompetition, error: competitionError } = useReadCurrentCompetition();
  const { data: campaigns, isLoading, error, refetch } = useReadCampaignsNotApproved(currentCompetition?.competition_id);

  if (isLoadingCompetition || isLoading) return <Loading />;

  if (competitionError) return <Error error={competitionError} reset={() => {}} />;

  if (!currentCompetition) return <Error error={{ name: "Not found", message: "Competition not found" }} reset={() => {}} />;

  if (error) return <Error error={error} reset={() => refetch()} />;

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar/>
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Review Campaigns</h3>
        <ReviewApplicationsTable applications={campaigns || []} />
      </div>

    </div>
  );
}
