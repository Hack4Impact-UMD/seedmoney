"use client";

import { mockAnalyticsData } from "@/src/app/dashboard/mockAnalyticsData";
import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";
import { buildEarningsTrendData } from "@/src/lib/utils/buildEarningsTrend";
import moment from "moment";


// ─── page ────────────────────────────────────────────────────────────────────

export default function CampaignAnalyticsPage() {
  const { earningsTrend, campaignGoal, campaignEndDate } = mockAnalyticsData;

  const todayIso = moment().startOf("day").format("YYYY-MM-DD");

  const { dates, dailyValues, totalValues } = buildEarningsTrendData(
    earningsTrend,
    campaignEndDate,
  );

  return (
    <div className="flex flex-col gap-6 mt-6">

      {/* Row 2: Earnings Trend chart */}
      <EarningsTrendCard
        dates={dates}
        dailyValues={dailyValues}
        totalValues={totalValues}
        campaignGoal={campaignGoal}
        todayIso={todayIso}
      />
    </div>
  );
}
