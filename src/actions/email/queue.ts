"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { prepareAdminEmail } from "@/src/lib/prepareAdminEmail";
import type { EmailRecipient } from "@/src/lib/emailRecipients";
import type { AdminEmailDraft, QueueEmailInput, QueueEmailResult, QueuedEmailReceipt } from "@/src/types/db/adminEmails";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QUEUED_STATUSES = new Set(["queued", "sending", "sent", "partially_failed", "failed"]);
const conflict = (): QueueEmailResult => ({ success: false, code: "conflict",
  errors: ["This draft changed or is no longer available. Reload it before queueing."] });

function receiptFor(value: unknown, emailId: string): QueuedEmailReceipt {
  const row = value as { email_id?: string; status?: string; recipient_count?: number; already_queued?: boolean } | null;
  if (!row || row.email_id !== emailId || !row.status || !QUEUED_STATUSES.has(row.status) ||
    typeof row.recipient_count !== "number" || !Number.isSafeInteger(row.recipient_count) || row.recipient_count < 1 ||
    typeof row.already_queued !== "boolean") throw new Error("Invalid queue receipt");
  return { emailId: row.email_id, status: row.status, recipientCount: row.recipient_count, alreadyQueued: row.already_queued };
}

export async function queueAdminEmail(input: QueueEmailInput): Promise<QueueEmailResult> {
  try {
    const session = await requireAdmin();
    const { data: { user }, error: authError } = await session.auth.getUser();
    if (authError || !user) throw new Error("Not authorized");
    if (!input || typeof input.id !== "string" || !UUID.test(input.id) || !Number.isSafeInteger(input.version) || input.version < 1) {
      return { success: false, code: "validation", errors: ["Save the draft and provide its current ID and version before queueing."] };
    }

    const supabase = createServiceRoleClient();
    const { data, error: readError } = await supabase.from("admin_emails")
      .select("id, created_by, competition_id, subject, body_html, recipient_groups, status, version, updated_at, queued_at")
      .eq("id", input.id).eq("created_by", user.id).maybeSingle();
    if (readError) throw readError;
    if (!data) return conflict();
    const draft = data as AdminEmailDraft & { queued_at: string | null };
    let subject = draft.subject, bodyHtml = draft.body_html, competitionId = draft.competition_id;
    let recipients: EmailRecipient[] = [];
    if (draft.status === "draft") {
      if (draft.version !== input.version) return conflict();
      // Resolve from saved content and account ownership, never browser recipients
      // or the result of an earlier preview validation.
      const prepared = await prepareAdminEmail({ subject, bodyHtml, competitionId,
        recipientGroups: draft.recipient_groups, mode: "send" });
      if (!prepared.success) return { success: false, code: "validation", errors: prepared.errors };
      subject = prepared.subject;
      bodyHtml = prepared.bodyHtml;
      competitionId = prepared.competitionId;
      recipients = prepared.recipients;
    } else if (!draft.queued_at || !QUEUED_STATUSES.has(draft.status)) return conflict();

    // The RPC serializes against autosave/discard and concurrent queue requests.
    // Already-queued jobs return an unchanged receipt even after delivery starts.
    const result = await supabase.rpc("queue_admin_email", {
      p_email_id: draft.id, p_actor_id: user.id, p_expected_version: input.version,
      p_competition_id: competitionId, p_subject: subject, p_body_html: bodyHtml,
      p_recipient_groups: draft.recipient_groups,
      p_recipients: recipients.map(recipient => ({ user_id: recipient.userId, recipient_email: recipient.email,
        first_name: recipient.firstName, campaign_id: recipient.campaignId, campaign_url: recipient.campaignUrl })),
    });
    if (result.error?.message === "email_draft_conflict") return conflict();
    if (result.error?.message === "email_competition_changed") {
      return { success: false, code: "conflict", errors: ["The current competition changed. Reload your draft before queueing."] };
    }
    if (result.error) throw result.error;
    return { success: true, receipt: receiptFor(result.data, draft.id) };
  } catch (error) {
    console.error("Unable to queue admin email:", error);
    return { success: false, code: "error", errors: ["Unable to confirm queueing. Retry this same draft; do not create a replacement email."] };
  }
}
