"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, usePathname, notFound } from "next/navigation";
import moment from "moment";

import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import NotComplete from "@/src/components/dashboard/NotComplete";
import Pending from "@/src/components/dashboard/Pending";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { mockAnalyticsData } from "@/src/app/dashboard/mockAnalyticsData";
import { getCampaignById, sampleCampaigns } from "../../sampleCampaigns";
import { useAuth } from "@/src/context/AuthProvider";

type DashboardTab = "Overview" | "Donors" | "Analytics";

function getDaysRemaining(endDateIso: string) {
  const today = moment().startOf("day");
  const end = moment(endDateIso, "YYYY-MM-DD");
  return Math.max(0, end.diff(today, "days"));
}

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();

  if (!user) notFound();


  const selectedCampaignId = Number(campaignId) || sampleCampaigns[0].campaign_id;
  const campaign = getCampaignById(selectedCampaignId);

  if (!campaign) notFound();

  const selectedTab: DashboardTab = pathname.endsWith("/donors")
    ? "Donors"
    : pathname.endsWith("/analytics")
      ? "Analytics"
      : "Overview";

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

  const handleCampaignChange = (newCampaignId: number) => {
    router.push(`/dashboard/${newCampaignId}`);
  };

  const handleContinueApplication = () => {
    console.log("Continue application for campaign:", selectedCampaignId);
  };

  if (campaign.status === "in_progress") {
    return (
      <div className="flex min-h-screen">
        <Navbar
          campaigns={sampleCampaigns}
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={handleCampaignChange}
        />
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">{campaign.name}</h3>
          <div className="flex-1 bg-gray-50 mt-10">
            <NotComplete onContinueApplication={handleContinueApplication} />
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "submitted_under_review") {
    return (
      <div className="flex min-h-screen">
        <Navbar
          campaigns={sampleCampaigns}
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={handleCampaignChange}
        />
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">{campaign.name}</h3>
          <div className="flex-1 bg-gray-50 mt-10">
            <Pending />
          </div>

        </div>

      </div>
    );
  }

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

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
