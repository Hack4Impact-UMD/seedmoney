"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";

const sampleCampaigns = [
  { id: "1", name: "Save the Ocean" },
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
        <h3 className="text-4xl font-bold text-[#096B2E]">
          {sampleCampaigns.find((c) => c.id === selectedId)?.name}
        </h3>
      </div>
    </div>
  );
}
