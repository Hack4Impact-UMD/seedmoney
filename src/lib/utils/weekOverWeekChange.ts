import moment from "moment";
import type { Transaction } from "@/src/types/db/transactions";

const succeeded = (t: Transaction) => t.status === "succeeded";

function partitionByWeek(
  transactions: Transaction[],
  competitionStartDate: string,
  today: moment.Moment = moment().startOf("day")
): { thisWeek: Transaction[]; lastWeek: Transaction[] } {
  const start = moment(competitionStartDate, "YYYY-MM-DD", true).startOf("day");
  const daysSinceStart = today.diff(start, "days");
  const weekNum = Math.floor(daysSinceStart / 7);

  const thisWeekStart = start.clone().add(weekNum * 7, "days");
  const thisWeekEnd = thisWeekStart.clone().add(6, "days");
  const lastWeekStart = start.clone().add((weekNum - 1) * 7, "days");
  const lastWeekEnd = lastWeekStart.clone().add(6, "days");

  const thisWeek: Transaction[] = [];
  const lastWeek: Transaction[] = [];
  for (const t of transactions.filter(succeeded)) {
    const d = moment(t.date, "YYYY-MM-DD", true).startOf("day");
    if (d.isBetween(thisWeekStart, thisWeekEnd, "day", "[]")) thisWeek.push(t);
    else if (weekNum > 0 && d.isBetween(lastWeekStart, lastWeekEnd, "day", "[]"))
      lastWeek.push(t);
  }

  
  return { thisWeek, lastWeek };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function calculateRaisedChangePercent(
  transactions: Transaction[],
  competitionStartDate: string,
): number {
  const { thisWeek, lastWeek } = partitionByWeek(transactions, competitionStartDate);
  const sum = (rows: Transaction[]) =>
    rows.reduce((a, r) => a + r.amount_donated, 0);
  return pctChange(sum(thisWeek), sum(lastWeek));
}

export function calculateDonorsChangePercent(
  transactions: Transaction[],
  competitionStartDate: string,
): number {
  const { thisWeek, lastWeek } = partitionByWeek(transactions, competitionStartDate);

  return pctChange(thisWeek.length, lastWeek.length);
}
