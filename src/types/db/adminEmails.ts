export const ADMIN_EMAIL_GROUP_LABELS = {
  all: "All Users",
  not_started: "Haven't started an application",
  unfinished: "Unfinished applications",
  approved: "Approved Campaigns",
} as const;

export type AdminEmailGroup = keyof typeof ADMIN_EMAIL_GROUP_LABELS;

export type EmailDraftValues = {
  subject: string;
  bodyHtml: string;
  recipientGroups: AdminEmailGroup[];
};

export type AdminEmailDraft = {
  id: string;
  created_by: string;
  competition_id: number | null;
  subject: string;
  body_html: string;
  recipient_groups: AdminEmailGroup[];
  status: string;
  version: number;
  updated_at: string;
};

export type SaveEmailDraftInput = EmailDraftValues & { id: string; version: number };
export type EmailDraftResult =
  | { success: true; draft: AdminEmailDraft | null }
  | { success: false; error: string; code: "error" | "conflict" | "validation" };

export type QueueEmailInput = Pick<AdminEmailDraft, "id" | "version">;
export type QueuedEmailReceipt = {
  emailId: string;
  status: string;
  recipientCount: number;
  alreadyQueued: boolean;
};
export type QueueEmailResult =
  | { success: true; receipt: QueuedEmailReceipt }
  | { success: false; code: "validation" | "conflict" | "error"; errors: string[] };

export type PendingAdminEmail = { id: string; subject: string; status: string; recipientCount: number };
export type EmailBatchProgress = {
  email_id: string;
  status: string;
  done: boolean;
  counts: Record<"pending" | "sending" | "accepted" | "failed" | "unknown" | "skipped", number>;
  paused: null | "rate_limited" | "check_brevo_credentials_or_sender";
  retry_after_seconds: number | null;
  needs_manual_review: boolean;
};
