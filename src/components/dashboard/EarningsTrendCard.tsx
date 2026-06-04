"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import moment from "moment";

function formatDate(date: string) {
  return moment(date, "YYYY-MM-DD").format("MMM D");
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
  const showTodayReferenceLine = dates.includes(todayIso);
  const maxEarnings = Math.max(
    0,
    ...dailyValues.filter((v): v is number => v !== null),
    ...totalValues.filter((v): v is number => v !== null),
  );
  const yAxisMax = Math.max(1, Math.ceil(maxEarnings * 1.25));
  const showGoalReferenceLine =
    Number.isFinite(campaignGoal) &&
    campaignGoal > 0 &&
    campaignGoal <= yAxisMax;

  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6 pb-2">
      {/* Header row */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-bold text-black">Earnings Trend</p>
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
            min: 0,
            max: yAxisMax,
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
        {showTodayReferenceLine && (
          <ChartsReferenceLine
            x={todayIso}
            lineStyle={{
              stroke: "rgba(0,0,0,0.15)",
              strokeWidth: 2,
            }}
            labelAlign="start"
            labelStyle={{ fill: "#6B7280", fontSize: 11, fontWeight: 500 }}
          />
        )}

        {showGoalReferenceLine && (
          <ChartsReferenceLine
            y={campaignGoal}
            lineStyle={{
              stroke: "#56BD60",
              strokeDasharray: "4 4",
              strokeWidth: 1.5,
            }}
            label={`Your Goal: $${campaignGoal}`}
            labelAlign="end"
            labelStyle={{ fill: "#56BD60", fontSize: 12, fontWeight: "bolder" }}
          />
        )}
      </LineChart>
    </div>
  );
}
