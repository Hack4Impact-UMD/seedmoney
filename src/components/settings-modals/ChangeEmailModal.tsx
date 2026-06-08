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
import { createBrowserClient } from "@/src/lib/supabase-client";

type ChangeEmailModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  isGoogleAuth?: boolean;
  onLogin?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeEmailModal({
  open,
  onClose,
  userEmail = "Could not fetch email.",
  isGoogleAuth = false,
  onLogin,
}: ChangeEmailModalProps) {
  const [step, setStep] = useState(0);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSendingChangeEmail, setIsSendingChangeEmail] = useState(false);

  const [oldEmailCode, setOldEmailCode] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [oldEmailError, setOldEmailError] = useState<string | null>(null);
  const [newEmailError, setNewEmailError] = useState<string | null>(null);
  const [isVerifyingOldEmail, setIsVerifyingOldEmail] = useState(false);
  const [isVerifyingNewEmail, setIsVerifyingNewEmail] = useState(false);

  const handleCancel = () => {
    onClose();
  };

  const debouncedEmail = useDebounce(newEmail, 200);
  const { data: isExistingEmail, isLoading } =
    useIsExistingEmail(debouncedEmail);

  const normalizedNewEmail = newEmail.trim();
  const normalizedDebouncedEmail = debouncedEmail.trim().toLowerCase();
  const isWaitingForExistingEmailCheck =
    EMAIL_REGEX.test(normalizedNewEmail) &&
    normalizedNewEmail.toLowerCase() !== userEmail.toLowerCase() &&
    normalizedNewEmail.toLowerCase() !== normalizedDebouncedEmail;
  const emailError =
    isExistingEmail &&
    normalizedNewEmail.toLowerCase() !== userEmail.toLowerCase()
      ? "Email already exists. Try again."
      : null;

  const canContinueToEmailChange =
    normalizedNewEmail.length > 0 &&
    normalizedNewEmail.toLowerCase() !== userEmail.toLowerCase() &&
    EMAIL_REGEX.test(normalizedNewEmail) &&
    !isWaitingForExistingEmailCheck &&
    !isLoading &&
    isExistingEmail === false;

  const handleSendEmailChange = async () => {
    if (isGoogleAuth) {
      return;
    }

    if (normalizedNewEmail.toLowerCase() === userEmail.toLowerCase()) {
      return;
    }

    try {
      setSubmitError(null);
      setIsSendingChangeEmail(true);

      const supabase = createBrowserClient();

      const { error } = await supabase.auth.updateUser({
        email: normalizedNewEmail,
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setStep(2);
    } finally {
      setIsSendingChangeEmail(false);
    }
  };

  const handleVerifyOldEmailOtp = async () => {
    try {
      setOldEmailError(null);
      setIsVerifyingOldEmail(true);

      const supabase = createBrowserClient();

      const { error } = await supabase.auth.verifyOtp({
        email: userEmail ?? "",
        token: oldEmailCode.trim(),
        type: "email_change",
      });

      if (error) {
        setOldEmailError(error.message);
        return;
      }

      setStep(3);
    } finally {
      setIsVerifyingOldEmail(false);
    }
  };

  const handleVerifyNewEmailOtp = async () => {
    try {
      setNewEmailError(null);
      setIsVerifyingNewEmail(true);

      const supabase = createBrowserClient();

      const { error } = await supabase.auth.verifyOtp({
        email: normalizedNewEmail,
        token: newEmailCode.trim(),
        type: "email_change",
      });

      if (error) {
        setNewEmailError(error.message);
        return;
      }

      setStep(4);
    } finally {
      setIsVerifyingNewEmail(false);
    }
  };

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
                value={userEmail}
                disabled
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Type New Email"
                placeholder="New email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
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
                onClick={handleSendEmailChange}
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
              message={`A code has been sent to your current email ${userEmail}.`}
              code={oldEmailCode}
              onCodeChange={(val) => {
                setOldEmailCode(val);
                setOldEmailError(null);
              }}
              error={oldEmailError}
              onResend={() => {
                setOldEmailCode("");
                setOldEmailError(null);
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
                disabled={!oldEmailCode.trim() || isVerifyingOldEmail}
                onClick={handleVerifyOldEmailOtp}
              >
                NEXT
              </Button>
            </>
          ),
        };
      case 3:
        return {
          body: (
            <VerificationCodeStep
              message={`A code has been sent to your new email ${normalizedNewEmail}.`}
              code={newEmailCode}
              onCodeChange={(val) => {
                setNewEmailCode(val);
                setNewEmailError(null);
              }}
              error={newEmailError}
              onResend={() => {
                setNewEmailCode("");
                setNewEmailError(null);
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
                disabled={!newEmailCode.trim() || isVerifyingNewEmail}
                onClick={handleVerifyNewEmailOtp}
              >
                VERIFY NEW EMAIL
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
