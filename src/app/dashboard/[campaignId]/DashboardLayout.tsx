"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, usePathname, notFound } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import { getCampaignById, sampleCampaigns } from "../sampleCampaigns";

type DashboardTab = "Overview" | "Donors" | "Analytics";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { campaignId } = useParams<{ campaignId: string }>();

  const selectedCampaignId = campaignId ?? sampleCampaigns[0].id;
  const campaign = getCampaignById(selectedCampaignId);

  if (!campaign) notFound();

  const selectedTab: DashboardTab =
    pathname.endsWith("/donors")
      ? "Donors"
      : pathname.endsWith("/analytics")
      ? "Analytics"
      : "Overview";

  const handleTabChange = (newValue: string) => {
    const basePath = `/dashboard/${selectedCampaignId}`;
    if (newValue === "Donors") return router.push(`${basePath}/donors`);
    if (newValue === "Analytics") return router.push(`${basePath}/analytics`);
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
        <h3 className="text-4xl font-bold text-[#096B2E]">{campaign.name}</h3>
        <DashboardTabs selectedTab={selectedTab} onChange={handleTabChange} />
        {children}
      </div>
    </div>
  );
}