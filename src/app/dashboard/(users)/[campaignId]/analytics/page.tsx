"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import moment from "moment";

import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";
import {
  buildEarningsTrendData,
  transactionsToDailyEarnings,
} from "@/src/lib/utils/buildEarningsTrend";
import useReadCampaignTransactions from "@/src/hooks/transactions/useReadCampaignTransactions";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import type { Campaign } from "@/src/types/db/campaigns";

export default function CampaignAnalyticsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaignIdNum = Number(campaignId);

  const {
    data: transactions,
    isLoading: txnsLoading,
    isError: txnsError,
  } = useReadCampaignTransactions(campaignIdNum);
  const {
    data: campaignData,
    isLoading: campaignLoading,
    isError: campaignError,
  } = useReadCampaign(campaignIdNum);
  const {
    data: competitionData,
    isLoading: competitionLoading,
    isError: competitionError,
  } = useReadCurrentCompetition();

  // useReadCampaign is typed as Campaign | Campaign[] — narrow to single.
  const campaign: Campaign | null = Array.isArray(campaignData)
    ? null
    : (campaignData ?? null);
  const campaignEndDate = competitionData?.end_date;

  const earnings = useMemo(
    () => transactionsToDailyEarnings(transactions ?? []),
    [transactions],
  );

  const { dates, dailyValues, totalValues } = useMemo(() => {
    if (earnings.length === 0 || !campaignEndDate) {
      return { dates: [], dailyValues: [], totalValues: [] };
    }
    return buildEarningsTrendData(earnings, campaignEndDate);
  }, [earnings, campaignEndDate]);

  const todayIso = moment().startOf("day").format("YYYY-MM-DD");

  const isLoading = txnsLoading || campaignLoading || competitionLoading;
  const hasError =
    txnsError || campaignError || competitionError || !campaign;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 h-[360px] flex items-center justify-center text-gray-500">
          Loading…
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 h-[360px] flex items-center justify-center text-gray-500">
          Could not load earnings trend.
        </div>
      </div>
    );
  }

  if (earnings.length === 0) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 h-[360px] flex flex-col items-center justify-center text-center">
          <p className="font-medium text-black">No donations yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Once donations start rolling in, you&apos;ll see your earnings
            trend here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <EarningsTrendCard
        dates={dates}
        dailyValues={dailyValues}
        totalValues={totalValues}
        campaignGoal={campaign.goal}
        todayIso={todayIso}
      />
    </div>
  );
}
