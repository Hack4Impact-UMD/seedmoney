"use client";

import Paper from "@mui/material/Paper";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

import { mockAnalyticsData } from "@/src/app/dashboard/mockAnalyticsData";

// ─── gradient defs ───────────────────────────────────────────────────────────

function AreaGradients() {
  const grad = (id: string, color: string) => (
    <linearGradient
      key={id}
      id={id}
      x1="0"
      y1="0"
      x2="0"
      y2="1"
      gradientUnits="objectBoundingBox"
    >
      <stop offset="0%" stopColor={color} stopOpacity={0.4} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );

  return (
    <defs>
      {grad("dailyGrad", "#10B981")}
      {grad("totalGrad", "#2410B9")}
    </defs>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatUSD(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDaysRemaining(endDateIso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateIso);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

// ─── sub-components ──────────────────────────────────────────────────────────

// sx kept here because Paper has its own elevation/shadow/border-radius defaults that need overriding
const cardSx = {
  borderRadius: 2,
  boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
};

function CardHeader({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <p className="text-gray-700 font-medium">{label}</p>
      <span className="text-gray-400">{icon}</span>
    </div>
  );
}

function TotalRaisedCard() {
  const { totalRaised, campaignGoal, raisedChangePercent } = mockAnalyticsData;
  const campaignPercent = Math.min(
    100,
    Math.round((totalRaised / campaignGoal) * 100),
  );

  return (
    <Paper elevation={0} sx={cardSx} className="p-6">
      <CardHeader label="Total Raised" icon={<AttachMoneyIcon />} />

      {/* Progress bar */}
      <div className="relative h-1/3 rounded-full bg-[#56bd604a] overflow-hidden my-13">
        <div
          className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full flex items-center pl-3 min-w-14"
          style={{ width: `${campaignPercent}%` }}
        >
          <span className="text-white font-bold text-[0.95rem] whitespace-nowrap">
            {campaignPercent}%
          </span>
        </div>
      </div>

      {/* Amount */}
      <h2 className="text-3xl font-bold text-gray-900 mb-1">
        {formatUSD(totalRaised)}
      </h2>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {campaignPercent}% of {formatUSD(campaignGoal)} goal
        </p>
        <p className="text-sm text-[#00A63E] font-medium">
          +{raisedChangePercent}% from last week
        </p>
      </div>
    </Paper>
  );
}

function TotalDonorsCard() {
  const { totalDonors, donorsChangePercent } = mockAnalyticsData;

  return (
    <Paper elevation={0} sx={cardSx} className="p-6">
      <CardHeader label="Total Donors" icon={<PeopleOutlineIcon />} />
      <h2 className="text-3xl font-bold text-gray-900 my-3">{totalDonors}</h2>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Donors</p>
        <p className="text-sm text-[#00A63E] font-medium">
          +{donorsChangePercent}% from last week
        </p>
      </div>
    </Paper>
  );
}

function DaysRemainingCard() {
  const daysRemaining = getDaysRemaining(mockAnalyticsData.campaignEndDate);

  return (
    <Paper elevation={0} sx={cardSx} className="p-6">
      <CardHeader label="Days Remaining" icon={<TrendingUpIcon />} />
      <h2 className="text-3xl font-bold text-gray-900 my-3">{daysRemaining}</h2>
      <p className="text-sm text-gray-500">days until campaign ends</p>
    </Paper>
  );
}

function EarningsTrendCard() {
  const { earningsTrend, campaignGoal, campaignEndDate } = mockAnalyticsData;

  // Build a full date range from first data point to campaign end date
  const dataByDate = new Map(earningsTrend.map((d) => [d.date, d]));
  const allDates: string[] = [];
  const cur = new Date(earningsTrend[0].date);
  const end = new Date(campaignEndDate);
  while (cur <= end) {
    allDates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10); // used for x-axis reference line

  const dates = allDates;
  const dailyValues = allDates.map((d) =>
    new Date(d) <= today ? (dataByDate.get(d)?.daily ?? 0) : null,
  );

  // keeps track of last total for days where there is no data
  let lastTotal = 0;
  const totalValues = allDates.map((d) => {
    if (new Date(d) > today) return null;
    const entry = dataByDate.get(d);
    if (entry) lastTotal = entry.total;
    return lastTotal || null;
  });

  return (
    <Paper elevation={0} sx={cardSx} className="p-6 pb-2">
      {/* Header row */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-black font-medium">Earnings Trend</p>
          <p className="text-sm text-gray-500">
            Your earnings over the campaign
          </p>
        </div>
        {/* Custom legend */}
        <div className="flex gap-6 items-center mt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2.5px] bg-[#10B981] rounded" />
            <span className="text-xs text-[#717182]">Daily Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2.5px] bg-[#2410B9] rounded" />
            <span className="text-xs text-[#717182]">Total Earnings</span>
          </div>
        </div>
      </div>

      <LineChart
        xAxis={[
          {
            data: dates,
            scaleType: "point",
            valueFormatter: (d: string) => formatDate(d),
            tickLabelStyle: { fontSize: 11, fill: "#6B7280" },
            tickInterval: (_: string, i: number) => i % 7 === 0,
          },
        ]}
        yAxis={[
          {
            valueFormatter: (v: number) => `$${v}`,
            tickLabelStyle: { fontSize: 11, fill: "#6B7280" },
          },
        ]}
        series={[
          {
            data: dailyValues,
            label: "Daily Earnings",
            color: "#10B981",
            area: true,
            showMark: false,
          },
          {
            data: totalValues,
            label: "Total Earnings",
            color: "#2410B9",
            area: true,
            showMark: false,
          },
        ]}
        height={320}
        margin={{ top: 30, right: 20, bottom: 20, left: 20 }}
        hideLegend={true}
        grid={{ vertical: true, horizontal: true }}
        sx={{
          // sx required here — these are internal MUI X Charts class selectors
          "& .MuiAreaElement-root": { fillOpacity: 0.15 },
          "& .MuiChartsAxis-line": { strokeWidth: 1 },
          "& .MuiChartsAxis-tick": { strokeWidth: 1 },
          "& .MuiChartsGrid-line": {
            strokeDasharray: "3 3",
            strokeWidth: 1,
            stroke: "#F0F0F0",
          },
        }}
      >
        <ChartsReferenceLine
          x={todayIso}
          lineStyle={{
            stroke: "rgba(0,0,0,0.15)",
            strokeWidth: 2,
          }}
          labelAlign="start"
          labelStyle={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
        />
        <ChartsReferenceLine
          y={campaignGoal}
          lineStyle={{
            stroke: "#56BD60",
            strokeDasharray: "4 4",
            strokeWidth: 1.5,
          }}
          label={`Your Goal: ${formatUSD(campaignGoal)}`}
          labelAlign="end"
          labelStyle={{ fill: "#56BD60", fontSize: 12, fontWeight: "bolder" }}
        />
      </LineChart>
    </Paper>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function CampaignAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Row 1: Total Raised + Donors & Days stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TotalRaisedCard />
        <div className="flex flex-col gap-6">
          <TotalDonorsCard />
          <DaysRemainingCard />
        </div>
      </div>

      {/* Row 2: Earnings Trend chart */}
      <EarningsTrendCard />
    </div>
  );
}
