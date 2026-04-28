"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
  notFound,
} from "next/navigation";
import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import DashboardTabs from "@/src/components/dashboard/DashboardTabs";
import NotComplete from "@/src/components/dashboard/NotComplete";
import Pending from "@/src/components/dashboard/Pending";
import Denied from "@/src/components/dashboard/Denied";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { useAuth } from "@/src/context/AuthProvider";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import Button from "@mui/material/Button";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useRaisedChangePercent from "@/src/hooks/transactions/useRaisedChangePercent";
import useDonorsChangePercent from "@/src/hooks/transactions/useDonorsChangePercent";
import BaseModal from "@/src/components/bases/BaseModal";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNew from "@mui/icons-material/OpenInNew";
import BaseAlert from "@/src/components/bases/BaseAlert";
import DashboardFooter from "@/src/components/DashboardFooter";
import FaqSection from "@/src/components/dashboard/FaqSection";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import { Chip } from "@mui/material";
import { getStatusLabel } from "@/src/lib/utils/statusConversions";
import { Status } from "@src/types/db/enums";
import moment from "moment";

type DashboardTab = "Overview" | "Donors" | "Analytics";


export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuth();
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserByAuthId(user?.id || "");
  const { data: campaignsData, isLoading, error} = useReadCampaign({ campaignId: Number(campaignId) });
  const { data: currentCompetitionData } = useReadCurrentCompetition();
  const {
    percent: raisedPercent,
    isLoading: raisedLoading,
    isError: raisedError,
  } = useRaisedChangePercent(Number(campaignId), currentCompetitionData?.start_date);
  const {
    percent: donorsPercent,
    isLoading: donorsLoading,
    isError: donorsError,
  } = useDonorsChangePercent(Number(campaignId), currentCompetitionData?.start_date);
  const raisedChangePercent =
    raisedLoading || raisedError ? null : raisedPercent;
  const donorsChangePercent =
    donorsLoading || donorsError ? null : donorsPercent;
  const [toast, setToast] = useState(false);
  const [viewCampaignModal, setViewCampaignModal] = useState(false);
  const submissionToastOpen = searchParams.get("submitted") === "1";

  const handleCloseSubmissionToast = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("submitted");
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (userData?.is_admin) {
      router.replace(`/dashboard/ongoing-campaigns/${campaignId}`);
    }
  }, [campaignId, router, userData?.is_admin]);

  useEffect(() => {
    if (!submissionToastOpen || !campaignsData?.length) {
      return;
    }

    if (campaignsData[0].status !== "pending") {
      handleCloseSubmissionToast();
    }
  }, [campaignsData, handleCloseSubmissionToast, submissionToastOpen]);

  if (!user) notFound();
  if (userError) throw userError;
  if (isLoadingUser) return <div>Loading...</div>;
  if (userData?.is_admin) return null;
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
    router.push("/apply/campaign");
  };

  const handleNewCampaign = () => {
    router.push("/apply");
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

  if (campaignData.status === "pending") {
    return (
      <div className="flex min-h-screen">
        <Navbar/>
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">{campaignData.name}</h3>
          <div className="flex-1 bg-gray-50 mt-10">
            <Pending />
          </div>
          <BaseAlert
            open={submissionToastOpen}
            onClose={handleCloseSubmissionToast}
            title="Application Submitted!"
          >
            Your application has been submitted successfully.
          </BaseAlert>
        </div>

      </div>
    );
  }

  if (campaignData.status === "denied") {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-50 p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {campaignData.name} (Not Approved)
          </h3>
          <div className="mt-10 flex flex-col gap-6">
            <Denied onNewCampaign={handleNewCampaign} />
            <FaqSection />
          </div>
          <DashboardFooter />
        </div>
      </div>
    );
  }

  const isChallengeActive =
  moment().isAfter(currentCompetitionData?.start_date) &&
  moment().isBefore(currentCompetitionData?.end_date);

  return (
    <div className="flex min-h-screen">
      <Navbar/>

      <div className="flex-1 bg-gray-50 p-10">
        <div className = "flex flex-row justify-between items-center">
          <div className = "flex flex-row items-center ">
            <h3 className="text-4xl font-bold text-[#096B2E]">{campaignData.name}</h3>
            <p className = "mt-[5px] ml-[10px] text-[#A6A6A6]">Created in {moment(currentCompetitionData?.start_date).format("YYYY")}</p>

          </div>

          <div>
            {isChallengeActive ? (
              <>
                <Chip
                  variant={campaignData.status}
                  label={getStatusLabel(campaignData.status)}
                />
                <Chip variant="published" label="SeedMoney Challenge Active" />
              </>
            ) : (
              <Chip variant="archived" label="SeedMoney Challenge Inactive" />
            )}
          </div>


        </div>


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
          onClick={() => router.push("/leaderboard")}
        >
          View Leaderboard
          <OpenInNew fontSize="small" className="text-[#123A1E] ml-[5px]" />

        </Button>
            
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <TotalRaisedCard
            totalRaised={campaignData.raised}
            campaignGoal={campaignData.goal}
            raisedChangePercent={raisedChangePercent}
          />

          <div className="flex flex-col gap-6">
            <TotalDonorsCard
              totalDonors={campaignData.donors}
              donorsChangePercent={donorsChangePercent}
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


    </div>
  );
}
