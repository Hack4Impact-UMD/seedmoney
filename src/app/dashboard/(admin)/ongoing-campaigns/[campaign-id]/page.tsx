"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";

import Navbar from "@/src/components/Navbar";
import DonorsTable from "@/src/components/DonorsTable";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";

import {
  buildEarningsTrendData,
  transactionsToDailyEarnings,
} from "@/src/lib/utils/buildEarningsTrend";

import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadCampaignTransactions from "@/src/hooks/transactions/useReadCampaignTransactions";
import useRaisedChangePercent from "@/src/hooks/transactions/useRaisedChangePercent";
import useDonorsChangePercent from "@/src/hooks/transactions/useDonorsChangePercent";

import { ArrowBack, OpenInNew } from "@mui/icons-material";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";
import LogoutIcon from "@mui/icons-material/Logout";

import { useMemo } from "react";
import moment from "moment";

export default function AdminCampaignPage() {
  const params = useParams();
  const router = useRouter();

  const campaignIdParam = params["campaign-id"];
  const campaignId =
    typeof campaignIdParam === "string" ? Number(campaignIdParam) : NaN;

  const [toast, setToast] = useState(false);
  const [viewCampaignModal, setViewCampaignModal] = useState(false);

  const {
    data: campaignsData,
    isLoading: campaignLoading,
    error: campaignError,
  } = useReadCampaign({ campaignId });

  const { data: currentCompetitionData, isLoading: competitionLoading } =
    useReadCurrentCompetition();

  const {
    data: transactions,
    isLoading: txnsLoading,
    isError: txnsError,
  } = useReadCampaignTransactions(campaignId);

  const {
    percent: raisedPercent,
    isLoading: raisedLoading,
    isError: raisedError,
  } = useRaisedChangePercent(campaignId, currentCompetitionData?.start_date);

  const {
    percent: donorsPercent,
    isLoading: donorsLoading,
    isError: donorsError,
  } = useDonorsChangePercent(campaignId, currentCompetitionData?.start_date);

  const raisedChangePercent =
    raisedLoading || raisedError ? null : raisedPercent;
  const donorsChangePercent =
    donorsLoading || donorsError ? null : donorsPercent;

  const campaignData = campaignsData?.[0] ?? null;

  const earnings = useMemo(
    () => transactionsToDailyEarnings(transactions ?? []),
    [transactions],
  );

  const { dates, dailyValues, totalValues } = useMemo(() => {
    const startDate = currentCompetitionData?.start_date;
    const endDate = currentCompetitionData?.end_date;

    if (earnings.length === 0 || !startDate || !endDate) {
      return { dates: [], dailyValues: [], totalValues: [] };
    }

    return buildEarningsTrendData(earnings, endDate, startDate);
  }, [
    earnings,
    currentCompetitionData?.start_date,
    currentCompetitionData?.end_date,
  ]);

  const todayIso = moment().startOf("day").format("YYYY-MM-DD");

  const handleBack = () => {
    router.push("/dashboard/ongoing-campaigns");
  };

  if (!Number.isFinite(campaignId)) {
    notFound();
  }

  if (campaignLoading || competitionLoading || txnsLoading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-50 p-10">Loading...</div>
      </div>
    );
  }

  if (campaignError) {
    throw campaignError;
  }

  if (!campaignData) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-50 p-10">Unable to load campaign.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1 flex-col bg-gray-50 p-10 space-y-3">
        <h3 className="text-4xl font-bold text-[#096B2E] mb-5">
          {campaignData.name}
        </h3>

        <p
          onClick={handleBack}
          className="cursor-pointer flex items-center uppercase !text-[#666666] text-sm font-bold"
        >
          <ArrowBack className="mr-1 !text-sm" fontSize="inherit" />
          Back
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            size="small"
            variant="contained"
            onClick={() => setViewCampaignModal(true)}
          >
            View Campaign Site
            <OpenInNew fontSize="small" className="ml-[5px]" />
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              navigator.clipboard.writeText(campaignData.givebutterlink ?? "");
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
            <OpenInNew fontSize="small" className="ml-[5px]" />
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/dashboard/ongoing-campaigns/${campaignId}/edit`)
            }
          >
            Edit
          </Button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TotalRaisedCard
            totalRaised={campaignData.raised}
            campaignGoal={campaignData.goal}
            raisedChangePercent={raisedChangePercent}
          />

          <div className="grid grid-rows-2 gap-8">
            <TotalDonorsCard
              totalDonors={campaignData.donors}
              donorsChangePercent={donorsChangePercent}
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

        {txnsError || dates.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 h-[360px] flex flex-col items-center justify-center text-center">
            <p className="font-medium text-black">No donations yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Once donations start rolling in, you&apos;ll see your earnings
              trend here.
            </p>
          </div>
        ) : (
          <EarningsTrendCard
            dates={dates}
            dailyValues={dailyValues}
            totalValues={totalValues}
            campaignGoal={campaignData.goal}
            todayIso={todayIso}
          />
        )}

        <DonorsTable campaignId={campaignId} />
      </div>

      <BaseModal
        open={viewCampaignModal}
        onClose={() => setViewCampaignModal(false)}
        title="You are about to leave the site"
      >
        <p className="text-[#666666] !text-[16px]">
          The link you have clicked will open a new website in a separate tab.
          Would you like to proceed?
        </p>

        <div className="flex flex-row mt-5 w-full justify-end">
          <Button
            variant="outlined"
            size="small"
            className="mt-4 !border-none !text-[#666666]"
            onClick={() => setViewCampaignModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            className="mt-4 !ml-3"
            onClick={() => {
              if (!campaignData.givebutterlink) return;
              window.open(campaignData.givebutterlink, "_blank");
            }}
          >
            Proceed
            <LogoutIcon className="!ml-[5px] !text-[18px]" />
          </Button>
        </div>
      </BaseModal>

      <BaseAlert
        open={toast}
        onClose={() => setToast(false)}
        title="Successfully Copied!"
      >
        <p>Link has been copied to clipboard</p>
      </BaseAlert>
    </div>
  );
}
