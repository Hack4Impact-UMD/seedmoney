"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ConfirmEditModalShell from "@/src/components/settings-modals/ConfirmEditModalShell";
import useCancelTransfer from "@/src/hooks/campaign-transfers/useCancelTransfer";
import useResendTransferInvitation from "@/src/hooks/campaign-transfers/useResendTransferInvitation";
import type { CampaignTransfer } from "@/src/types/accountDeletion";

export type TransferToast = { title: string; message?: string };

type ManageTransferModalProps = {
  transfer: CampaignTransfer & { recipientName?: string | null };
  campaignName: string;
  onClose: () => void;
  // Called after a resend or cancel succeeds; the modal has already closed.
  onDone: (toast: TransferToast) => void;
};

const TITLE_COLOR = "#123A1E";
const ERROR_COLOR = "#D32F2F";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Resend or cancel a pending or expired invitation. Mount it to open it.
export default function ManageTransferModal({
  transfer,
  campaignName,
  onClose,
  onDone,
}: ManageTransferModalProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const resend = useResendTransferInvitation();
  const cancel = useCancelTransfer();

  const isExpired = transfer.status === "expired";
  const recipient = transfer.recipientName
    ? `${transfer.recipientName} (${transfer.recipientEmail})`
    : transfer.recipientEmail;
  const isBusy = resend.isPending || cancel.isPending;
  const error = resend.error ?? cancel.error;

  const handleResend = () => {
    resend.mutate(transfer.id, {
      onSuccess: ({ emailSent }) => {
        onClose();
        onDone(
          emailSent
            ? { title: "Invitation resent", message: "We emailed the recipient." }
            : {
                title: "Invitation saved",
                message:
                  "The invitation was saved, but the email couldn't be sent. Try resending it.",
              },
        );
      },
    });
  };

  const handleCancel = () => {
    cancel.mutate(transfer.id, {
      onSuccess: () => {
        onClose();
        onDone({ title: "Transfer canceled" });
      },
    });
  };

  if (confirmingCancel) {
    return (
      <ConfirmEditModalShell
        open
        onClose={onClose}
        title="Cancel this transfer?"
        titleColor={TITLE_COLOR}
        actions={
          <>
            <Button
              variant="text"
              size="medium"
              onClick={() => setConfirmingCancel(false)}
              disabled={isBusy}
            >
              Keep transfer
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleCancel}
              disabled={isBusy}
              className="enabled:bg-[#D32F2F]! enabled:hover:bg-[#B71C1C]!"
            >
              {cancel.isPending ? "Canceling..." : "Cancel transfer"}
            </Button>
          </>
        }
      >
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: "14px", sm: "16px" }, lineHeight: 1.5 }}
        >
          The invitation to {recipient} will <strong>stop working</strong>.{" "}
          {campaignName} stays yours and you can transfer it again anytime.
        </Typography>
        {cancel.error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {cancel.error.message}
          </Typography>
        )}
      </ConfirmEditModalShell>
    );
  }

  return (
    <ConfirmEditModalShell
      open
      onClose={onClose}
      title={isExpired ? "Invitation expired" : "Transfer pending"}
      titleColor={TITLE_COLOR}
      actions={
        <>
          <Button
            variant="text"
            size="medium"
            onClick={() => setConfirmingCancel(true)}
            disabled={isBusy}
            sx={{ color: ERROR_COLOR }}
          >
            Cancel transfer
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleResend}
            disabled={isBusy}
          >
            {resend.isPending ? "Sending..." : "Resend invitation"}
          </Button>
        </>
      }
    >
      <div className="text-[14px] leading-[1.5] text-black sm:text-[16px]">
        {isExpired ? (
          <p>
            The invitation to <strong>{recipient}</strong> to take over{" "}
            {campaignName} expired on {formatDate(transfer.expiresAt)}.
          </p>
        ) : (
          <p>
            {campaignName} is waiting for <strong>{recipient}</strong> to
            accept.
          </p>
        )}
        <ul className="mt-6">
          <li>• Invitation sent: {formatDate(transfer.sentAt)}</li>
          <li>
            • {campaignName} <strong>stays yours</strong>
            {isExpired ? "." : " until they accept."}
          </li>
          <li>
            {isExpired
              ? "• Resend it to send them a new link."
              : "• Not seeing the email? Ask them to check their spam folder, or resend it."}
          </li>
        </ul>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error.message}
          </Typography>
        )}
      </div>
    </ConfirmEditModalShell>
  );
}
