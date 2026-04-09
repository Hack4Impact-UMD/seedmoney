"use client";
import Navbar from "@/src/components/Navbar";
import CampaignsTable from "@/src/components/CampaignsTable";

import useReadOngoingCampaigns from "@/src/hooks/campaigns/useReadOngoingCampaigns";

export default function OngoingApplicationsPage() {
  const { data: campaigns, isLoading, error } = useReadOngoingCampaigns();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Error loading campaigns: {error.message}</p>
      </div>
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