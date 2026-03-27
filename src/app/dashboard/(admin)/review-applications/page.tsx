"use client";
import Navbar from "@/src/components/Navbar";
export default function ReviewCampaigns() {
  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Review Campaigns</h3>

      </div>
    </div>
    

  );
}