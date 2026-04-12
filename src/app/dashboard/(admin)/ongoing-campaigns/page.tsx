"use client";
import Navbar from "@/src/components/Navbar";
import CampaignsTable from "@/src/components/CampaignsTable";
import Loading from "@/src/app/loading";
import Error from "@/src/app/error";

import useReadOngoingCampaigns from "@/src/hooks/campaigns/useReadOngoingCampaigns";

export default function OngoingApplicationsPage() {
  const { data: campaigns, isLoading, error, refetch } = useReadOngoingCampaigns();

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <Error error={error} reset={() => refetch()} />
    )
  }

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E] mb-5">Ongoing Campaigns</h3>
        <CampaignsTable initialData={campaigns || []}/>

      </div>
    </div>
    

  );
}