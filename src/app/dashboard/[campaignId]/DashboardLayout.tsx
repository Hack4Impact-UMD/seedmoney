"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import { getCampaignById, sampleCampaigns } from "../sampleCampaigns";

type DashboardTab = "Overview" | "Donors" | "Analytics";

type DashboardLayoutProps = {
  selectedTab: DashboardTab;
  children: ReactNode;
};

export default function DashboardLayout({
  selectedTab,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const params = useParams();

  const rawCampaignId = params.campaignId;
  const campaignId = Array.isArray(rawCampaignId)
    ? rawCampaignId[0]
    : rawCampaignId;
  const selectedCampaignId = campaignId ?? sampleCampaigns[0].id;
  const campaign = getCampaignById(selectedCampaignId);

  const handleTabChange = (newValue: string) => {
    const basePath = `/dashboard/${selectedCampaignId}`;

    if (newValue === "Donors") {
      router.push(`${basePath}/donors`);
      return;
    }

    if (newValue === "Analytics") {
      router.push(`${basePath}/analytics`);
      return;
    }

    router.push(basePath);
  };

  const handleCampaignChange = (newCampaignId: string) => {
    router.push(`/dashboard/${newCampaignId}`);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={sampleCampaigns}
        selectedCampaignId={selectedCampaignId}
        onCampaignSelect={handleCampaignChange}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">
          {campaign?.name ?? "Campaign not found"}
        </h3>
        <DashboardTabs selectedTab={selectedTab} onChange={handleTabChange} />
        {children}
      </div>
    </div>
  );
}
