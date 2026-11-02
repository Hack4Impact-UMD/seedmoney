"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ConfirmEditModalShell from "@/src/components/settings-modals/ConfirmEditModalShell";
import { useAuth } from "@/src/context/AuthProvider";
import useSendTransferInvitation from "@/src/hooks/campaign-transfers/useSendTransferInvitation";
import type { CampaignTransferFlowProps } from "@/src/types/accountDeletion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TITLE_COLOR = "#123A1E";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Email form, then a confirmation step that sends the invitation.
// Mount it to open it; the parent shows the success toast.
export default function CampaignTransferFlow({
  campaignId,
  campaignName,
  onInvitationSent,
  onCancel,
}: CampaignTransferFlowProps) {
  const { user } = useAuth();
  const sendInvitation = useSendTransferInvitation(campaignId);

  const [step, setStep] = useState<"email" | "confirm">("email");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [touched, setTouched] = useState({ email: false, confirm: false });

  const normalizedEmail = normalizeEmail(email);

  let emailError: string | null = null;
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    emailError = "Enter a valid email address";
  } else if (normalizedEmail === normalizeEmail(user?.email ?? "")) {
    emailError = "That's your own email. Enter the new owner's email.";
  }

  const confirmError =
    normalizeEmail(confirmEmail) === normalizedEmail
      ? null
      : "The emails don't match.";

  const showEmailError = touched.email && email.length > 0 && !!emailError;
  const showConfirmError =
    touched.confirm && confirmEmail.length > 0 && !!confirmError;

  const handleSend = () => {
    sendInvitation.mutate(normalizedEmail, {
      onSuccess: (result) => onInvitationSent(result.emailSent),
    });
  };

  if (step === "email") {
    return (
      <ConfirmEditModalShell
        open
        onClose={onCancel}
        title={`Transfer “${campaignName}”`}
        titleColor={TITLE_COLOR}
        actions={
          <>
            <Button variant="text" size="medium" onClick={onCancel}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={!!emailError || !!confirmError}
              onClick={() => setStep("confirm")}
            >
              NEXT
            </Button>
          </>
        }
      >
        <Typography variant="body1">
          Enter the email of the person who should take over. They&apos;ll get
          an invitation to accept, and can create a SeedMoney account if they
          don&apos;t have one.
        </Typography>
        <Box display="flex" flexDirection="column" gap={2.5} mt={3}>
          <TextField
            fullWidth
            type="email"
            label="New owner’s email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={showEmailError}
            helperText={showEmailError ? emailError : undefined}
          />
          <TextField
            fullWidth
            type="email"
            label="Confirm new owner’s email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            error={showConfirmError}
            helperText={showConfirmError ? confirmError : undefined}
          />
        </Box>
      </ConfirmEditModalShell>
    );
  }

  return (
    <ConfirmEditModalShell
      open
      onClose={onCancel}
      title="Send transfer invitation?"
      titleColor={TITLE_COLOR}
      actions={
        <>
          <Button
            variant="text"
            size="medium"
            onClick={onCancel}
            disabled={sendInvitation.isPending}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSend}
            disabled={sendInvitation.isPending}
          >
            {sendInvitation.isPending ? "SENDING..." : "SEND INVITATION"}
          </Button>
        </>
      }
    >
      <Typography variant="body1">
        We&apos;ll invite <strong>{normalizedEmail}</strong> to take over{" "}
        <strong>“{campaignName}”</strong>.
      </Typography>
      <ul className="mt-6">
        <li>• Campaign: {campaignName}</li>
        <li>
          • Once they accept, they become the campaign leader and you lose
          access.
        </li>
        <li>• The campaign stays published and donations aren&apos;t affected.</li>
      </ul>
      {sendInvitation.error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {sendInvitation.error.message}
        </Typography>
      )}
    </ConfirmEditModalShell>
  );
}
