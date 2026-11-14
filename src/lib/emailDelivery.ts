import type { EmailBatchProgress } from "@/src/types/db/adminEmails";

const STATES = ["pending", "sending", "accepted", "failed", "unknown", "skipped"] as const;
function batchResult(value: unknown, emailId: string): EmailBatchProgress {
  const row = value as EmailBatchProgress | null;
  if (!row || row.email_id !== emailId || typeof row.done !== "boolean" ||
    !row.counts || STATES.some(state => !Number.isSafeInteger(row.counts[state]) || row.counts[state] < 0) ||
    ![null, "rate_limited", "check_brevo_credentials_or_sender"].includes(row.paused) ||
    row.needs_manual_review !== (row.counts.unknown > 0) ||
    (row.done ? !["sent", "failed", "partially_failed"].includes(row.status) || row.counts.pending + row.counts.sending !== 0
      : !["queued", "sending"].includes(row.status) || typeof row.retry_after_seconds !== "number" ||
        !Number.isSafeInteger(row.retry_after_seconds) || row.retry_after_seconds < 1 || row.retry_after_seconds > 86400)) {
    throw new Error("Unexpected delivery response. Resume this same email; do not queue another copy.");
  }
  return row;
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

// The caller supplies an authenticated Supabase functions.invoke, not a service key.
export async function sendEmailBatches(
  emailId: string,
  invoke: () => Promise<{ data: unknown; error: unknown }>,
  onProgress: (progress: EmailBatchProgress) => void,
  signal: AbortSignal,
) {
  while (!signal.aborted) {
    const result = await invoke();
    if (signal.aborted) return;
    if (result.error) throw new Error("Unable to confirm this batch. Resume the same queued email; accepted recipients will not be resent.");
    const batch = batchResult(result.data, emailId);
    onProgress(batch);
    if (batch.done) return;
    if (batch.paused === "check_brevo_credentials_or_sender") {
      throw new Error("Delivery paused. Check the Brevo credentials and authorized sender before resuming.");
    }
    await wait(batch.retry_after_seconds! * 1000, signal);
  }
}
