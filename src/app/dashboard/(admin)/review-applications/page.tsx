"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/components/ReviewApplicationsTable";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useUpdateCompetition from "@/src/hooks/competition-metadata/useUpdateCompetition";
import Loading from "@/src/app/loading";
import Error from "@/src/app/error";
import useReadCampaignsNotApproved from "@/src/hooks/campaigns/table/useReadCampaignsNotApproved";

export default function ReviewApplicationsPage() {
  const { data: currentCompetition, isLoading: isLoadingCompetition, error: competitionError } = useReadCurrentCompetition();
  const { data: campaigns, isLoading, error, refetch } = useReadCampaignsNotApproved(currentCompetition?.competition_id);
  const updateCompetition = useUpdateCompetition();

  if (isLoadingCompetition || isLoading) return <Loading />;
  if (competitionError) return <Error error={competitionError} reset={() => {}} />;
  if (!currentCompetition) return <Error error={{ name: "Not found", message: "Competition not found" }} reset={() => {}} />;
  if (error) return <Error error={error} reset={() => refetch()} />;

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar />
      <div className="flex-1 bg-gray-50 px-4 py-6 md:p-10">
        <h3 className="hidden text-4xl font-bold text-[#096B2E] md:block">
          Review Campaigns
        </h3>
        <ReviewApplicationsTable
          applications={campaigns || []}
          isApplicationOpen={currentCompetition.is_application_open ?? false}
          isTogglingApplication={updateCompetition.isPending}
          onToggleApplication={() =>
            updateCompetition.mutate({
              competitionId: currentCompetition.competition_id,
              updates: { is_application_open: !currentCompetition.is_application_open },
            })
          }
        />
      </div>
    </div>
  );
}