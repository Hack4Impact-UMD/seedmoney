export type DailyEarning = {
  date: string; // ISO date string, e.g. "2025-11-15"
  daily: number; // dollars raised that day
  total: number; // cumulative total raised
};

export type AnalyticsData = {
  totalRaised: number;
  campaignGoal: number;
  totalDonors: number;
  donorsChangePercent: number; // week-over-week change (e.g. 12.5 = +12.5%)
  raisedChangePercent: number; // week-over-week change
  campaignEndDate: string; // ISO date string
  earningsTrend: DailyEarning[];
};

export const mockAnalyticsData: AnalyticsData = {
  totalRaised: 1095,
  campaignGoal: 1200,
  totalDonors: 41,
  donorsChangePercent: 30,
  raisedChangePercent: 12.5,
  campaignEndDate: "2026-03-18",
  // Only days with actual donations — gaps are filled by the chart with carry-forward totals
  earningsTrend: [
    { date: "2025-11-15", daily: 120, total: 120 },
    { date: "2025-11-18", daily: 75, total: 195 },
    { date: "2025-11-22", daily: 200, total: 395 },
    { date: "2025-11-29", daily: 50, total: 445 },
    { date: "2025-12-03", daily: 85, total: 530 },
    { date: "2025-12-10", daily: 40, total: 570 },
    { date: "2025-12-14", daily: 60, total: 630 },
    { date: "2025-12-21", daily: 150, total: 780 },
    { date: "2025-12-28", daily: 30, total: 810 },
    { date: "2026-01-05", daily: 45, total: 855 },
    { date: "2026-01-12", daily: 70, total: 925 },
    { date: "2026-01-13", daily: 25, total: 950 },
    { date: "2026-01-21", daily: 55, total: 1005 },
    { date: "2026-01-23", daily: 35, total: 1040 },
    { date: "2026-01-24", daily: 40, total: 1080 },
    { date: "2026-01-25", daily: 60, total: 1140 },
    { date: "2026-02-11", daily: 20, total: 1160 },
    { date: "2026-02-12", daily: 33, total: 1193 },
    { date: "2026-02-13", daily: 47, total: 1240 },
    { date: "2026-02-24", daily: 28, total: 1268 },
    { date: "2026-02-25", daily: 30, total: 1298 },
    { date: "2026-02-26", daily: 300, total: 1598 },
    { date: "2026-03-05", daily: 22, total: 1620 },
  ],
};
