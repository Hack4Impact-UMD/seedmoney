"use client";

import { redirect } from "next/navigation";
import { sampleCampaigns } from "./sampleCampaigns";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";

export default function DashboardIndexPage() {
  if (sampleCampaigns.length > 0) {
    redirect(`/dashboard/${sampleCampaigns[0].campaign_id}`);
  }

  const handleNewCampaign = () => {
    // TODO: navigate to the new campaign creation flow
    console.log("New campaign clicked");
  };

  return (
    <div className="flex min-h-screen">
      <Navbar campaigns={[]} selectedCampaignId={0} onCampaignSelect={() => {}} />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Dashboard</h3>
        <div className="flex items-center justify-center mt-10">
          <NotStarted onNewCampaign={handleNewCampaign} />
        </div>
      </div>
    </div>
  );
}
