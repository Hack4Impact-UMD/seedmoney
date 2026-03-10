import moment from "moment";

export function buildEarningsTrendData(
  earningsTrend: { date: string; daily: number; total: number }[],
  campaignEndDate: string,
) {
  // Index the sparse data by date string for O(1) lookups during the loop.
  const dataByDate = new Map(earningsTrend.map((d) => [d.date, d]));

  // Walk day-by-day from the first donation date to the campaign end date.
  const allDates: string[] = [];
  const cur = moment(earningsTrend[0].date, "YYYY-MM-DD", true).startOf("day");
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
    return lastTotal || null;
  });

  return { dates: allDates, dailyValues, totalValues };
}