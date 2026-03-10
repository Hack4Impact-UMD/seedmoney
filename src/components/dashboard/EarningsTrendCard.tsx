"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

function formatUSD(value: number) {
  return `$${value.toLocaleString()}`;
}

// Parses "YYYY-MM-DD" into a local-midnight Date so toLocaleDateString
// displays the correct day. new Date(iso) would treat the string as UTC
// midnight, shifting the displayed date back by one day in UTC-behind zones.
function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(iso: string) {
  return parseLocalDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function EarningsTrendCard({
  dates,
  dailyValues,
  totalValues,
  campaignGoal,
  todayIso,
}: {
  dates: string[];
  dailyValues: (number | null)[];
  totalValues: (number | null)[];
  campaignGoal: number;
  todayIso: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 pb-2">
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
    </div>
  );
}
