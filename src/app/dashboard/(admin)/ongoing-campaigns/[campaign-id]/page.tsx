"use client"
import { useParams } from "next/navigation"

import Navbar from "@/src/components/Navbar";
import DonorsTable from "@/src/components/DonorsTable";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";

import { ArrowBack } from "@mui/icons-material";
import moment from "moment";


export default function AdminCampaignPage() {
  const params = useParams();
  const campaignId = params["campaign-id"];
  // TODO: Get actual campaign data
  const mockCampaignData = {
    campaign_title: "Full Belly Community Garden",
    raised: 130,
    goal: 1200,
    total_donors: 12,
    days_remaining: 23,
    donors_change_percent: 12.5,
    raised_change_percent: 12.5,
    dates: [
      "2026-03-20", "2026-03-21", "2026-03-22", 
      "2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26",
      "2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30",
    ],
    dailyValues: [20, 15, 0, 45, 10, 30, 10],
    totalValues: [20, 35, 35, 80, 90, 120, 130],
  }

  const todayIso = moment().startOf("day").format("YYYY-MM-DD");

  const handleBack = () => {
    window.history.back();
  }

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 flex-col bg-gray-50 p-10 space-y-3">
        <h3 className="text-4xl font-bold text-[#096B2E] mb-5">Campaign {campaignId}</h3>
        <p onClick={handleBack} className="cursor-pointer flex items-center uppercase !text-[#666666] text-sm font-bold">
          <ArrowBack className="mr-1 !text-sm" fontSize="inherit"/>
          Back
        </p>

        <div className="flex flex-wrap gap-3">
          <button className="bg-[#2c7a45] text-white px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-[#2d5a43] transition">
            View Campaign Site
          </button>
          <button className="bg-white border border-[#2c7a45] text-[#2c7a45] px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-emerald-50 transition">
            Copy Campaign Site Link
          </button>
          <button className="bg-white border border-[#2c7a45] text-[#2c7a45] px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-emerald-50 transition">
            View Leaderboard
          </button>
          <button className="bg-white border border-[#2c7a45] text-[#2c7a45] px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-emerald-50 transition">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <TotalRaisedCard
            totalRaised={mockCampaignData.raised}
            campaignGoal={mockCampaignData.goal}
            raisedChangePercent={mockCampaignData.raised_change_percent} 
          />
          <div className="grid grid-rows-2 gap-8">
            <TotalDonorsCard
              totalDonors={mockCampaignData.total_donors}
              donorsChangePercent={mockCampaignData.donors_change_percent}
            />
            <DaysRemainingCard
              daysRemaining={mockCampaignData.days_remaining}
            />
          </div>
        </div>

        <EarningsTrendCard
          dates={mockCampaignData.dates}
          dailyValues={mockCampaignData.dailyValues}
          totalValues={mockCampaignData.totalValues}
          campaignGoal={mockCampaignData.goal}
          todayIso={todayIso}
        />

        <DonorsTable campaignId={Number(campaignId)} />
      </div>
    </div>
  )
}

