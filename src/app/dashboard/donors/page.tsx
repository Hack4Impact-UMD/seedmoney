"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";

const sampleCampaigns = [
  { id: "1", name: "Save the Ocean" },
  { id: "2", name: "Community Garden Project" },
  { id: "3", name: "Save the Garden" },
];

export default function DonorsDashboardPage() {
  const [selectedId, setSelectedId] = useState("1");
  const router = useRouter();
  const pathname = usePathname();

  const selectedTab =
    pathname === "/dashboard/donors"
      ? "Donors"
      : pathname === "/dashboard/analytics"
        ? "Analytics"
        : "Overview";

  const handleTabChange = (newValue: string) => {
    if (newValue === "Donors") {
      router.push("/dashboard/donors");
      return;
    }

    if (newValue === "Analytics") {
      router.push("/dashboard/analytics");
      return;
    }

    router.push("/dashboard");
  };

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
        <DashboardTabs selectedTab={selectedTab} onChange={handleTabChange} />
      </div>
    </div>
  );
}
