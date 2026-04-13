import moment from "moment";
import type { Transaction } from "@/src/types/db/transactions";

const succeeded = (t: Transaction) => t.status === "succeeded";

function partitionByWeek(
  transactions: Transaction[],
  today: moment.Moment = moment().startOf("day"),
): { thisWeek: Transaction[]; lastWeek: Transaction[] } {
  const thisStart = today.clone().subtract(6, "days");
  const lastStart = today.clone().subtract(13, "days");
  const lastEnd = today.clone().subtract(7, "days");

  const thisWeek: Transaction[] = [];
  const lastWeek: Transaction[] = [];
  for (const t of transactions.filter(succeeded)) {
    const d = moment(t.date, "YYYY-MM-DD", true).startOf("day");
    if (d.isBetween(thisStart, today, "day", "[]")) thisWeek.push(t);
    else if (d.isBetween(lastStart, lastEnd, "day", "[]")) lastWeek.push(t);
  }
  return { thisWeek, lastWeek };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function calculateRaisedChangePercent(
  transactions: Transaction[],
): number {
  const { thisWeek, lastWeek } = partitionByWeek(transactions);
  const sum = (rows: Transaction[]) =>
    rows.reduce((a, r) => a + r.amount_donated, 0);
  return pctChange(sum(thisWeek), sum(lastWeek));
}

export function calculateDonorsChangePercent(
  transactions: Transaction[],
): number {
  const { thisWeek, lastWeek } = partitionByWeek(transactions);
  const unique = (rows: Transaction[]) =>
    new Set(rows.map((r) => r.email)).size;
  return pctChange(unique(thisWeek), unique(lastWeek));
}
