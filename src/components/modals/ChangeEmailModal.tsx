"use client";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ConfirmEditModalShell from "./ConfirmEditModalShell";
import VerificationCodeStep from "./VerificationCodeStep";

type ChangeEmailModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
};

export default function ChangeEmailModal({
  open,
  onClose,
  userEmail = "johnsmith@gmail.com",
}: ChangeEmailModalProps) {
  const [step, setStep] = useState(0);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setNewEmail("");
      setVerificationCode("");
      setCodeError(null);
    }
  }, [open]);

  const handleCancel = () => {
    onClose();
  };

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
                disabled={!newEmail.trim()}
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
              message={`A code has been sent to johnsmith@gmail.com`}
              code={verificationCode}
              onCodeChange={(val) => {
                setVerificationCode(val);
                setCodeError(null);
              }}
              error={codeError}
              onResend={() => console.log("Resend verification code")}
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
                  if (verificationCode.trim() === "123456") {
                    setCodeError(null);
                    setStep(3);
                  } else {
                    setCodeError("Invalid Code. Try again.");
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
                We&apos;ve sent a confirmation link to {newEmail}.
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Didn&apos;t receive it?{" "}
                <Typography
                  component="span"
                  variant="body2"
                  onClick={() => console.log("Resend confirmation")}
                  sx={{
                    color: "#00A63E",
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
              {/* For UI demo: allow advancing to success step */}
              <Button
                variant="contained"
                size="medium"
                onClick={() => setStep(4)}
              >
                CONTINUE
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
            <Button variant="contained" size="medium" onClick={handleCancel}>
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
    <ConfirmEditModalShell open={open} onClose={handleCancel} actions={actions}>
      {body}
    </ConfirmEditModalShell>
  );
}
