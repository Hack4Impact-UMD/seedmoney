"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";

const sampleCampaigns = [
  { id: "1", name: "Save the Ocean Campaign" },
  { id: "2", name: "Community Garden Project" },
  { id: "3", name: "Save the Garden" },
];

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState("1");

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={sampleCampaigns}
        selectedCampaignId={selectedId}
        onCampaignSelect={setSelectedId}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Selected campaign: {sampleCampaigns.find((c) => c.id === selectedId)?.name}
        </p>
      </div>
    </div>
  );
}
