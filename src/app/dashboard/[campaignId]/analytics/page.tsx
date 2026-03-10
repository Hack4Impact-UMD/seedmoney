"use client";

import { mockAnalyticsData } from "@/src/app/dashboard/mockAnalyticsData";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";

// ─── helpers ────────────────────────────────────────────────────────────────

// Parses a "YYYY-MM-DD" string into a local-midnight Date.
function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Serializes a Date back to "YYYY-MM-DD" using local time getters.
function localDateIso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns the number of whole days between today (local midnight) and the campaign end date.
function getDaysRemaining(endDateIso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // truncate to local midnight so we count full days
  const end = parseLocalDate(endDateIso);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

function buildEarningsTrendData(
  earningsTrend: { date: string; daily: number; total: number }[],
  campaignEndDate: string,
) {
  // Index the sparse data by date string for O(1) lookups during the loop.
  const dataByDate = new Map(earningsTrend.map((d) => [d.date, d]));

  // Walk day-by-day from the first donation date to the campaign end date,
  const allDates: string[] = [];
  const cur = parseLocalDate(earningsTrend[0].date);
  const end = parseLocalDate(campaignEndDate);
  while (cur <= end) {
    allDates.push(localDateIso(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Daily earnings: real value for past days with a donation, 0 for past days
  // with no donation, null for future days (null = no data point on the chart).
  const dailyValues = allDates.map((d) =>
    parseLocalDate(d) <= today ? (dataByDate.get(d)?.daily ?? 0) : null,
  );

  // Cumulative total: carry the last known total forward through days with no
  // donation entry, so the "Total Earnings" line is continuous rather than
  // dropping to zero on gap days. Future days get null.
  let lastTotal = 0;
  const totalValues = allDates.map((d) => {
    if (parseLocalDate(d) > today) return null;
    const entry = dataByDate.get(d);
    if (entry) lastTotal = entry.total;
    return lastTotal || null;
  });

  return { dates: allDates, dailyValues, totalValues };
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function CampaignAnalyticsPage() {
  const { earningsTrend, campaignGoal, campaignEndDate } = mockAnalyticsData;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = localDateIso(today);

  const { dates, dailyValues, totalValues } = buildEarningsTrendData(
    earningsTrend,
    campaignEndDate,
  );

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Row 1: Total Raised + Donors & Days stacked */}
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
