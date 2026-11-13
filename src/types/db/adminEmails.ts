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
