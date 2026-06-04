import moment from "moment";
import type { Transaction } from "@/src/types/db/transactions";

export type DailyEarning = {
  date: string; // ISO date string, e.g. "2025-11-15"
  daily: number; // dollars raised that day
  total: number; // cumulative total raised
};

function toDateKey(value: string) {
  const date = moment.parseZone(value, moment.ISO_8601, true);
  return date.isValid() ? date.format("YYYY-MM-DD") : null;
}

/**
 * Aggregate raw transactions into per-day earnings with a running cumulative
 * total. Filters out non-success rows and returns an empty array for empty
 * input. The result plugs directly into buildEarningsTrendData.
 */
export function transactionsToDailyEarnings(
  transactions: Transaction[],
): DailyEarning[] {
  if (transactions.length === 0) return [];

  // Sum amount_donated per date, keeping only successful rows.
  const dailyByDate = new Map<string, number>();
  for (const t of transactions) {
    const status = t.status.toLowerCase();
    const date = toDateKey(t.date);
    const amount = Number(t.amount_donated);

    if (
      (status !== "succeeded" && status !== "paid") ||
      !date ||
      !Number.isFinite(amount)
    ) {
      continue;
    }

    dailyByDate.set(date, (dailyByDate.get(date) ?? 0) + amount);
  }

  // Sort dates ascending and build the cumulative series.
  const sortedDates = [...dailyByDate.keys()].sort();
  let running = 0;
  return sortedDates.map((date) => {
    const daily = dailyByDate.get(date)!;
    running += daily;
    return { date, daily, total: running };
  });
}

export function buildEarningsTrendData(
  earningsTrend: DailyEarning[],
  campaignEndDate: string,
  campaignStartDate?: string,
) {
  // Empty input guard — no donations means no series to plot.
  if (earningsTrend.length === 0) {
    return { dates: [], dailyValues: [], totalValues: [] };
  }

  // Index the sparse data by date string for O(1) lookups during the loop.
  const dataByDate = new Map(earningsTrend.map((d) => [d.date, d]));

  // Walk from competition start (if provided) or first donation date.
  const allDates: string[] = [];
  const walkStart = campaignStartDate ?? earningsTrend[0].date;
  const cur = moment(walkStart, "YYYY-MM-DD", true).startOf("day");
  const end = moment(campaignEndDate, "YYYY-MM-DD", true).startOf("day");
  while (cur.isSameOrBefore(end, "day")) {
    allDates.push(cur.format("YYYY-MM-DD"));
    cur.add(1, "day");
  }

  const today = moment().startOf("day");

  // Daily earnings: real value for past days with a donation, 0 for past days
  // with no donation, null for future days (null = no data point on the chart).
  const dailyValues = allDates.map((d) =>
    moment(d, "YYYY-MM-DD", true).isSameOrBefore(today, "day")
      ? (dataByDate.get(d)?.daily ?? 0)
      : null,
  );

  // Cumulative total: carry the last known total forward through days with no
  // donation entry, so the "Total Earnings" line is continuous rather than
  // dropping to zero on gap days. Future days get null.
  let lastTotal = 0;
  const totalValues = allDates.map((d) => {
    if (moment(d, "YYYY-MM-DD", true).isAfter(today, "day")) return null;
    const entry = dataByDate.get(d);
    if (entry) lastTotal = entry.total;
    return lastTotal;
  });

  return { dates: allDates, dailyValues, totalValues };
}
