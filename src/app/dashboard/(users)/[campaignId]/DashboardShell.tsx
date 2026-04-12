"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, usePathname, notFound } from "next/navigation";
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
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import BaseModal from "@/src/components/bases/BaseModal";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNew from "@mui/icons-material/OpenInNew";
import BaseAlert from "@/src/components/bases/BaseAlert";
import DashboardFooter from "@/src/components/DashboardFooter";

type DashboardTab = "Overview" | "Donors" | "Analytics";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const { data: campaignsData, isLoading, error} = useReadCampaign({ campaignId: Number(campaignId) });
  const { data: currentCompetitionData } = useReadCurrentCompetition();
  const [toast, setToast] = useState(false);
  const [viewCampaignModal, setViewCampaignModal] = useState(false);


  if (!user) notFound();
  if (isLoading ) return <div>Loading...</div>;
  if (error) throw error;
  if (!campaignsData) return <div className="flex min-h-screen" >Unable to load campaign.</div>;
  if (campaignsData.length === 0) notFound();

  const campaignData = campaignsData[0];

  const selectedCampaignId = Number(campaignId);

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

        <Button size="small" variant="contained" className = "!mr-2" onClick={() => setViewCampaignModal(true)}>View Campaign Site
          <OpenInNew fontSize="small" className="text-[#FFFFFF] ml-[5px]" />
        </Button>
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
        <Button 
          size="small" 
          variant="outlined"
          onClick={() => router.push(`/dashboard/${selectedCampaignId}/donors`)}
        >
          View Leaderboard
          <OpenInNew fontSize="small" className="text-[#123A1E] ml-[5px]" />

        </Button>
            
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
              startDate={currentCompetitionData?.start_date ?? null}
              endDate={currentCompetitionData?.end_date ?? null}
              is_current={campaignData.competition_id == currentCompetitionData?.competition_id}
            />
          </div>
        </div>

        <div className="mt-8">{children}</div>
        <DashboardFooter />
      </div>


      
      <BaseModal open={viewCampaignModal} onClose={() => setViewCampaignModal(false)} title="You are about to leave the site">
          
          <p className = "text-[#666666] !text-[16px]">The link you have clicked will open a new website in a separate tab. Would you like to proceed? </p>

          <div className ="flex flex-row mt-5 w-full justify-end">
            <Button variant="outlined" size = "small" className="mt-4  !border-none !text-[#666666]" onClick={() => setViewCampaignModal(false)}>Cancel</Button>

            <Button variant="contained" size = "small" className = "mt-4 !ml-3" onClick={() => window.open(campaignData.givebutterlink, '_blank')}>
              Proceed
              <LogoutIcon className="!ml-[5px] !text-[18px]" />
              
            </Button>
          </div>

      
      </BaseModal>


          
      <BaseAlert open={toast} onClose={() => setToast(false)} title="Successfully Copied!">
          <p>Link has been copied to clipboard</p>
      </BaseAlert>

      {campaignData.competition_id !== currentCompetitionData?.competition_id &&
        <BaseAlert
          open={true}
          onClose={() => {}}
          title="This campaign has ended!"
        >
          <p>This page now displays the final <br></br>statistics of your campaign</p>
        </BaseAlert>
      }
    </div>
  );
}
