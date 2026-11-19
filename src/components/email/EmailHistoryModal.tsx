"use client";

import { Button } from "@mui/material";
import BaseModal from "@/src/components/bases/BaseModal";
import EmailPreviewBody from "./EmailPreviewBody";
import { EXAMPLE_TOKEN_VALUES, fillEmailTokens } from "./emailTokens";
import { useEmailHistoryDetail } from "@/src/hooks/email/useEmailHistory";
import { EMAIL_HISTORY_LABELS } from "@/src/types/emailHistory";
import { formatHistoryDate } from "@/src/lib/emailHistory";

export default function EmailHistoryModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const detail = useEmailHistoryDetail(id);
  const email = detail.data;
  return <BaseModal open={Boolean(id)} onClose={onClose} title="Sent email">
    {detail.isPending && <p role="status">Loading email...</p>}
    {detail.isError && <div role="alert">{detail.error.message} <Button onClick={() => void detail.refetch()}>Retry</Button></div>}
    {email && !detail.isError && <div className="min-w-0 space-y-4">
      <h3 className="break-words font-semibold">{email.subject}</h3>
      <p>{EMAIL_HISTORY_LABELS[email.status]} · {formatHistoryDate(email.completed_at)} UTC</p>
      <dl className="grid grid-cols-2 gap-2">
        {Object.entries(email.counts).map(([status, count]) => <div key={status}>
          <dt>{status === "accepted" ? "Accepted by provider" : status === "unknown" ? "Uncertain" : status.charAt(0).toUpperCase() + status.slice(1)}</dt>
          <dd>{count}</dd>
        </div>)}
      </dl>
      {email.last_error && <p role="alert" className="break-words text-red-700">{email.last_error}</p>}
      <h4 className="font-semibold">Message preview (example values)</h4>
      <EmailPreviewBody html={fillEmailTokens(email.body_html, EXAMPLE_TOKEN_VALUES)} />
    </div>}
    <div className="mt-4 flex justify-end"><Button onClick={onClose}>Close</Button></div>
  </BaseModal>;
}
