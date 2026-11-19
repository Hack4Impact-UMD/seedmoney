import { ADMIN_EMAIL_GROUP_LABELS } from "@/src/types/db/adminEmails";
import type { EmailHistoryInput } from "@/src/types/emailHistory";

export function validHistoryInput(input: EmailHistoryInput) {
  return input && Number.isSafeInteger(input.page) && input.page >= 0 && input.page <= 100_000 &&
    [5, 10, 20].includes(input.pageSize) && (input.group === "any" || Object.hasOwn(ADMIN_EMAIL_GROUP_LABELS, input.group)) &&
    (input.month === "all" || /^\d{4}-(0[1-9]|1[0-2])$/.test(input.month) && Number(input.month.slice(0, 4)) >= 2000);
}

export function historyMonthBounds(month: string) {
  const [year, number] = month.split("-").map(Number);
  return [new Date(Date.UTC(year, number - 1, 1)).toISOString(), new Date(Date.UTC(year, number, 1)).toISOString()];
}

export function formatHistoryDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) : "Unavailable";
}
