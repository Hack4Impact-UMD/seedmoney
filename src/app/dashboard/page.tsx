"use client";

import Navbar from "@/src/components/Navbar";

const sampleCampaigns = [
  { id: "1", name: "Save the Ocean Campaign" },
  { id: "2", name: "Community Garden Project" },
  { id: "3", name: "Save the Garden" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Navbar campaigns={sampleCampaigns} selectedCampaignId="1" />
      <div className="flex-1 bg-gray-50 p-10">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Select a campaign from the sidebar.
        </p>
      </div>
    </div>
  );
}
