import type { AdminEmailGroup } from "./db/adminEmails";

export const EMAIL_HISTORY_STATUSES = ["sent", "partially_failed", "failed"] as const;
export const EMAIL_HISTORY_LABELS: Record<string, string> = {
  sent: "Accepted by provider", partially_failed: "Partially failed", failed: "Failed",
};
export const EMAIL_RECIPIENT_STATUSES = ["pending", "sending", "accepted", "failed", "unknown", "skipped"] as const;
export type EmailHistoryInput = { page: number; pageSize: number; month: string; group: string };
export type EmailHistoryRow = {
  id: string; subject: string; status: string; completed_at: string | null;
  queued_at: string; recipient_groups: AdminEmailGroup[];
  admin_email_recipients: { count: number }[];
};
export type EmailHistoryPage = { emails: EmailHistoryRow[]; total: number };
export type EmailHistoryDetail = EmailHistoryRow & {
  body_html: string; last_error: string | null;
  counts: Record<typeof EMAIL_RECIPIENT_STATUSES[number], number>;
};
export type EmailHistoryResult<T> = { success: true; data: T } | { success: false; error: string };
