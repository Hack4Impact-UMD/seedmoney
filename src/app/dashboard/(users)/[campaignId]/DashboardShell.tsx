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
import DashboardTabs, {
  type DashboardTabItem,
} from "@/src/components/dashboard/DashboardTabs";
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
import BaseModal from "@/src/components/bases/BaseModal";
import OpenInNew from "@mui/icons-material/OpenInNew";
import BaseAlert from "@/src/components/bases/BaseAlert";
import DashboardFooter from "@/src/components/DashboardFooter";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import { Chip } from "@mui/material";
import { getStatusLabel } from "@/src/lib/utils/statusConversions";
import moment from "moment";
import InformationSection from "@/src/components/dashboard/InformationSection";

const USER_DASHBOARD_TABS: readonly DashboardTabItem[] = [
  { label: "Overview", sectionId: "dashboard-overview" },
  { label: "Donations", sectionId: "dashboard-donations" },
  { label: "Analytics", sectionId: "dashboard-analytics" },
  { label: "Help", sectionId: "dashboard-help" },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
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
  const {
    data: campaignsData,
    isLoading,
    error,
  } = useReadCampaign({ campaignId: Number(campaignId) });
  const { data: currentCompetitionData } = useReadCurrentCompetition();
  const {
    percent: raisedPercent,
    isLoading: raisedLoading,
    isError: raisedError,
  } = useRaisedChangePercent(
    Number(campaignId),
    currentCompetitionData?.start_date,
  );
  const raisedChangePercent =
    raisedLoading || raisedError ? null : raisedPercent;
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
      router.replace(`/dashboard/approved-campaigns/${campaignId}`);
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
  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;
  if (!campaignsData)
    return <div className="flex min-h-screen">Unable to load campaign.</div>;
  if (campaignsData.length === 0) notFound();

  const campaignData = campaignsData[0];
  const competitionStartDate = currentCompetitionData?.start_date;
  const competitionEndDate = currentCompetitionData?.end_date;
  const createdYear = competitionStartDate
    ? moment(competitionStartDate).format("YYYY")
    : null;

  const selectedCampaignId = Number(campaignId);

  const handleContinueApplication = () => {
    router.push("/apply/campaign");
  };

  const isViewingPendingApplication = pathname.endsWith("/application");

  const handleNewCampaign = () => {
    router.push("/apply");
  };

  if (campaignData.status === "in_progress") {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-[#F6FAF9] p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {campaignData.name}
          </h3>
          <div className="flex-1 bg-[#F6FAF9] mt-10">
            <NotComplete onContinueApplication={handleContinueApplication} />
            <InformationSection />
          </div>
          <DashboardFooter />
        </div>
      </div>
    );
  }

  if (campaignData.status === "pending") {
    if (isViewingPendingApplication) {
      return (
        <div className="flex min-h-screen">
          <Navbar />
          <div className="min-w-0 flex-1 overflow-y-auto bg-[#F6FAF9] p-4 pb-24 md:p-10 md:pb-10">
            {children}
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-[#F6FAF9] p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {campaignData.name}
          </h3>
          <div className="flex-1 bg-[#F6FAF9] mt-10">
            <Pending
              onViewApplication={() =>
                router.push(`/dashboard/${selectedCampaignId}/application`)
              }
            />

            <InformationSection />
          </div>
          <DashboardFooter />
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
        <div className="flex-1 bg-[#F6FAF9] p-10">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {campaignData.name} (Not Approved)
          </h3>
          <div className="mt-10 flex flex-col gap-6">
            <Denied onNewCampaign={handleNewCampaign} />
            <InformationSection />
          </div>
          <DashboardFooter />
        </div>
      </div>
    );
  }

  const isChallengeActive = Boolean(
    competitionStartDate &&
      competitionEndDate &&
      moment().isAfter(competitionStartDate) &&
      moment().isBefore(competitionEndDate),
  );

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 min-w-0 overflow-x-clip bg-[#F6FAF9] p-4 pb-24 md:p-10 md:pb-10">
        <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center">
            <h3 className="text-2xl md:text-4xl font-bold text-[#096B2E]">
              {campaignData.name}
            </h3>
            {createdYear && (
              <p className="text-sm text-[#A6A6A6] md:ml-[10px] md:mt-[5px]">
                Created in {createdYear}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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

        <DashboardTabs tabs={USER_DASHBOARD_TABS} showMobileScrollControls />

        <section id="dashboard-overview" className="scroll-mt-20">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mt-2">
            <Button
              size="small"
              variant="contained"
              className="!shrink-0"
              onClick={() => setViewCampaignModal(true)}
            >
              View Campaign
              <OpenInNew fontSize="small" className="text-[#FFFFFF] ml-[5px]" />
            </Button>
            <Button
              size="small"
              variant="outlined"
              className="!shrink-0"
              onClick={async () => {
                const campaignUrl = campaignData.givebutterlink;
                const isMobile =
                  typeof window !== "undefined" &&
                  window.matchMedia("(max-width: 767px)").matches;

                if (isMobile && navigator.share) {
                  try {
                    await navigator.share({
                      title: campaignData.name,
                      url: campaignUrl,
                    });
                    return;
                  } catch (error) {
                    if (
                      error instanceof DOMException &&
                      error.name === "AbortError"
                    ) {
                      return;
                    }
                  }
                }

                try {
                  await navigator.clipboard.writeText(campaignUrl);
                  setToast(true);
                } catch {
                  return;
                }
              }}
            >
              <span className="md:hidden">Share campaign</span>
              <span className="hidden md:inline">Copy campaign link</span>
            </Button>
            <Button
              size="small"
              variant="outlined"
              className="!shrink-0"
              onClick={() => router.push("/leaderboard")}
            >
              Leaderboard
              <OpenInNew fontSize="small" className="text-[#123A1E] ml-[5px]" />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <TotalRaisedCard
              totalRaised={campaignData.raised}
              campaignGoal={campaignData.goal}
              raisedChangePercent={raisedChangePercent}
            />

            <div className="grid grid-cols-2 gap-4 md:flex md:flex-col md:gap-6">
              <TotalDonorsCard
                totalDonors={campaignData.donors}
              />

              <DaysRemainingCard
                startDate={currentCompetitionData?.start_date ?? null}
                endDate={currentCompetitionData?.end_date ?? null}
                is_current={
                  campaignData.competition_id ===
                  currentCompetitionData?.competition_id
                }
              />
            </div>
          </div>
        </section>

        <div className="mt-8">{children}</div>
        <DashboardFooter />
      </div>

      <BaseModal
        open={viewCampaignModal}
        onClose={() => setViewCampaignModal(false)}
        title="You are about to leave the site"
      >
        <p className="text-[#666666] !text-[16px]">
          The link you have clicked will open a new website in a separate tab.
          Would you like to proceed?{" "}
        </p>

        <div className="flex flex-row mt-5 w-full justify-end">
          <Button
            variant="outlined"
            size="small"
            className="mt-4  !border-none !text-[#666666]"
            onClick={() => setViewCampaignModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            className="mt-4 !ml-3"
            onClick={() => {
              window.open(campaignData.givebutterlink, "_blank");
              setViewCampaignModal(false);
            }}
          >
            Proceed
          </Button>
        </div>
      </BaseModal>

      <BaseAlert
        open={toast}
        onClose={() => setToast(false)}
        title="Link copied!"
        copySuccess
      >
        <p>Campaign link has been copied to clipboard</p>
      </BaseAlert>
      {currentCompetitionData != null &&
        campaignData.competition_id !==
          currentCompetitionData.competition_id && (
          <BaseAlert
            open={true}
            onClose={() => {}}
            title="This campaign has ended!"
          >
            <p>
              This page now displays the final <br></br>statistics of your
              campaign
            </p>
          </BaseAlert>
        )}
    </div>
  );
}
