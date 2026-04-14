"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ConfirmEditModalShell from "./ConfirmEditModalShell";
import VerificationCodeStep from "./VerificationCodeStep";
import useIsExistingEmail, {
  useDebounce,
} from "@/src/hooks/users/useIsExistingEmail";

type ChangeEmailModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  onLogin?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_DEMO_VERIFICATION_CODE = "123456";

export default function ChangeEmailModal({
  open,
  onClose,
  userEmail = "Could not fetch email.",
  onLogin,
}: ChangeEmailModalProps) {
  const [step, setStep] = useState(0);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleCancel = () => {
    onClose();
  };

  const debouncedEmail = useDebounce(newEmail, 400);
  const isExistingEmail = useIsExistingEmail(debouncedEmail).data;

  const normalizedNewEmail = newEmail.trim();
  const canContinueToEmailChange =
    normalizedNewEmail.length > 0 &&
    normalizedNewEmail.toLowerCase() !== userEmail.toLowerCase() &&
    EMAIL_REGEX.test(normalizedNewEmail) &&
    !isExistingEmail;
  const modalTitle =
    step === 0
      ? "Change Email"
      : step === 1 || step === 2
        ? "Verify Email"
        : step === 3
          ? "Confirm New Email"
          : "Email Change Success";

  const renderStep = () => {
    switch (step) {
      case 0:
        return {
          body: (
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                variant="outlined"
                fullWidth
                label="Current Email"
                value={userEmail || "johnsmith@gmail.com"}
                disabled
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Type New Email"
                placeholder="New email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Box>
          ),
          actions: (
            <>
              <Button variant="text" size="medium" onClick={handleCancel}>
                CANCEL
              </Button>
              <Button
                variant="contained"
                size="medium"
                disabled={!canContinueToEmailChange}
                onClick={() => setStep(1)}
              >
                NEXT
              </Button>
            </>
          ),
        };

      case 1:
        return {
          body: (
            <Box sx={{ py: 1 }}>
              <Typography variant="body1">
                Please verify your old email {userEmail} before changing to your
                new email.
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5 }}>
                We&apos;ll send a verification code to your email.
              </Typography>
            </Box>
          ),
          actions: (
            <>
              <Button variant="text" size="medium" onClick={handleCancel}>
                CANCEL
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={() => setStep(2)}
              >
                SEND VERIFICATION EMAIL
              </Button>
            </>
          ),
        };

      case 2:
        return {
          body: (
            <VerificationCodeStep
              message={`A code has been sent to your email ${userEmail}.`}
              code={verificationCode}
              onCodeChange={(val) => {
                setVerificationCode(val);
                setCodeError(null);
              }}
              error={codeError}
              onResend={() => {
                setVerificationCode("");
                setCodeError(null);
              }}
            />
          ),
          actions: (
            <>
              <Button variant="text" size="medium" onClick={handleCancel}>
                CANCEL
              </Button>
              <Button
                variant="contained"
                size="medium"
                disabled={!verificationCode.trim()}
                onClick={() => {
                  if (
                    verificationCode.trim() === VALID_DEMO_VERIFICATION_CODE
                  ) {
                    setCodeError(null);
                    setStep(3);
                  } else {
                    setCodeError("Invalid Code. Try again.");
                    setVerificationCode("");
                  }
                }}
              >
                NEXT
              </Button>
            </>
          ),
        };

      case 3:
        return {
          body: (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                To complete your email change, verify your new address.
                We&apos;ve sent a confirmation link to {normalizedNewEmail}.
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Didn&apos;t receive it?{" "}
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => console.log("Resend confirmation")}
                  sx={{
                    color: "#1976d2",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                >
                  Resend
                </Typography>
              </Typography>
            </Box>
          ),
          actions: (
            <>
              <Button variant="text" size="medium" onClick={handleCancel}>
                CANCEL
              </Button>
            </>
          ),
        };

      case 4:
        return {
          body: (
            <Typography variant="body1">
              Your email has been successfully changed!
            </Typography>
          ),
          actions: (
            <Button
              variant="contained"
              size="medium"
              onClick={onLogin ?? handleCancel}
            >
              LOG IN
            </Button>
          ),
        };

      default:
        return { body: null, actions: null };
    }
  };

  const { body, actions } = renderStep();

  return (
    <ConfirmEditModalShell
      open={open}
      onClose={handleCancel}
      actions={actions}
      title={modalTitle}
    >
      {body}
    </ConfirmEditModalShell>
  );
}
