"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, usePathname, notFound } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import { getCampaignById, sampleCampaigns } from "../sampleCampaigns";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { mockAnalyticsData } from "@/src/app/dashboard/mockAnalyticsData";
import moment from "moment";

type DashboardTab = "Overview" | "Donors" | "Analytics";

function getDaysRemaining(endDateIso: string) {
  const today = moment().startOf("day");
  const end = moment(endDateIso, "YYYY-MM-DD");

  const diff = end.diff(today, "days");

  return Math.max(0, diff);
}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TotalRaisedCard
            totalRaised={mockAnalyticsData.totalRaised}
            campaignGoal={mockAnalyticsData.campaignGoal}
            raisedChangePercent={mockAnalyticsData.raisedChangePercent}
          />
          <div className="flex flex-col gap-6">
            <TotalDonorsCard
              totalDonors={mockAnalyticsData.totalDonors}
              donorsChangePercent={mockAnalyticsData.donorsChangePercent}
            />
            <DaysRemainingCard
              daysRemaining={getDaysRemaining(mockAnalyticsData.campaignEndDate)}
            />
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}