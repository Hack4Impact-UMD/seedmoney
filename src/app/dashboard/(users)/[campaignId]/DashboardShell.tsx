"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, usePathname, notFound } from "next/navigation";
import moment from "moment";
import { useState } from "react";

import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import NotComplete from "@/src/components/dashboard/NotComplete";
import Pending from "@/src/components/dashboard/Pending";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { useAuth } from "@/src/context/AuthProvider";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import Button from "@mui/material/Button";
import { Snackbar, Alert } from "@mui/material";
type DashboardTab = "Overview" | "Donors" | "Analytics";

function getDaysRemaining() {
  const today = moment().startOf("day");
  const end = moment("2026-04-14", "YYYY-MM-DD");
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
  const { data: campaignData, isLoading } = useReadCampaign(Number(campaignId));
  const [toast, setToast] = useState(false);

  if (!user) notFound();
  if (isLoading ) return <div>Loading...</div>;
  if (!campaignData) notFound();
  if (Array.isArray(campaignData)) notFound();

  const selectedCampaignId = Number(campaignId);
  if (Array.isArray(campaignData)) notFound();

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

  const handleContinueApplication = () => {
    console.log("Continue application for campaign:", selectedCampaignId);
  };

  if (campaignData.status === "in_progress") {
    return (
      <div className="flex min-h-screen">
        <Navbar/>
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">{campaignData.name}</h3>
          <div className="flex-1 bg-gray-50 mt-10">
            <NotComplete onContinueApplication={handleContinueApplication} />
          </div>
        </div>
      </div>
    );
  }

  if (campaignData.status === "submitted_under_review") {
    return (
      <div className="flex min-h-screen">
        <Navbar/>
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">{campaignData.name}</h3>
          <div className="flex-1 bg-gray-50 mt-10">
            <Pending />
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar/>

      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">{campaignData.name}</h3>

        <DashboardTabs selectedTab={selectedTab} onChange={handleTabChange} />

        <Button size="small" variant="contained" className = "!mr-2" onClick={() => router.push(campaignData.givebutterlink)}>View Campaign Site</Button>
        <Button
          size="small"
          variant="outlined"
          className="!mr-2"
          onClick={() => {
            navigator.clipboard.writeText(campaignData.givebutterlink);
            setToast(true);
          }}
        >
          Copy Campaign Site Link
        </Button>        
        <Button size="small" variant="outlined" onClick={() => router.push(`/dashboard/${selectedCampaignId}/donors`)}>View Leaderboard</Button>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <TotalRaisedCard
            totalRaised={campaignData.raised}
            campaignGoal={campaignData.goal}
            raisedChangePercent={0}
          />

          <div className="flex flex-col gap-6">
            <TotalDonorsCard
              totalDonors={campaignData.donors}
              donorsChangePercent={0}
            />

            <DaysRemainingCard
              daysRemaining={getDaysRemaining()}
            />
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </div>


      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(false)}
          severity="success"
          variant="outlined"
        >
          Campaign Link Copied!
        </Alert>
      </Snackbar>
    </div>
  );
}
