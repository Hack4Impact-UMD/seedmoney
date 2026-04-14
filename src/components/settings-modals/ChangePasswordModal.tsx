"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ConfirmEditModalShell from "./ConfirmEditModalShell";
import VerificationCodeStep from "./VerificationCodeStep";
import { createBrowserClient } from "@/src/lib/supabase-client";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  onLogin?: () => void;
};

const validatePassword = (password: string) => {
  if (!password) {
    return null;
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one capital letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }

  return null;
};

export default function ChangePasswordModal({
  open,
  onClose,
  userEmail = "johnsmith@gmail.com",
  onLogin,
}: ChangePasswordModalProps) {
  const [step, setStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSendingVerificationEmail, setIsSendingVerificationEmail] =
    useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleCancel = () => {
    onClose();
  };

  const handleSendVerificationEmail = async () => {
    try {
      setSubmitError(null);
      setCodeError(null);
      setIsSendingVerificationEmail(true);

      const supabase = createBrowserClient();
      const { error } = await supabase.auth.reauthenticate();

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setStep(1);
    } finally {
      setIsSendingVerificationEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setPasswordError(null);
      setCodeError(null);
      setIsUpdatingPassword(true);

      const nextPasswordError = validatePassword(newPassword);

      if (nextPasswordError) {
        setPasswordError(nextPasswordError);
        return;
      }

      if (newPassword !== confirmPassword) {
        return;
      }

      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        nonce: verificationCode.trim(),
      });

      if (error) {
        const normalizedMessage = error.message.toLowerCase();

        if (
          normalizedMessage.includes("nonce") ||
          normalizedMessage.includes("otp") ||
          normalizedMessage.includes("token")
        ) {
          setCodeError(error.message);
          setStep(1);
          return;
        }

        setPasswordError(error.message);
        return;
      }

      setStep(3);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const passwordsMatch =
    !!newPassword &&
    !!confirmPassword &&
    newPassword === confirmPassword;
  const localPasswordError = validatePassword(newPassword);
  const newPasswordError = localPasswordError || passwordError;
  const showPasswordError =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const modalTitle =
    step === 0 || step === 1
      ? "Verify Email"
      : step === 2
        ? "Change Password"
        : "Password Change Success";

  const renderStep = () => {
    switch (step) {
      case 0:
        return {
          body: (
            <Box>
              <Typography variant="body1">
                Please verify your email {userEmail} before changing your
                password. We&apos;ll send a verification code to your email.
              </Typography>
              {submitError && (
                <Typography variant="body2" sx={{ color: "#d32f2f", mt: 2 }}>
                  {submitError}
                </Typography>
              )}
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
                disabled={isSendingVerificationEmail}
                onClick={handleSendVerificationEmail}
              >
                SEND VERIFICATION EMAIL
              </Button>
            </>
          ),
        };

      case 1:
        return {
          body: (
            <VerificationCodeStep
              message="A code has been sent to your email."
              code={verificationCode}
              onCodeChange={(val) => {
                setVerificationCode(val);
                setCodeError(null);
              }}
              error={codeError}
              onResend={() => {
                setVerificationCode("");
                setCodeError(null);
                void handleSendVerificationEmail();
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
                onClick={() => setStep(2)}
              >
                NEXT
              </Button>
            </>
          ),
        };

      case 2:
        return {
          body: (
            <Box>
              <Typography variant="body1" sx={{ color: "black", mb: 2 }}>
                Changing your password will log you out of your account. You
                will need to sign in again.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Type new password"
                  placeholder="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  error={!!newPasswordError}
                  helperText={newPasswordError || ""}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword((p) => !p)}
                            edge="end"
                            aria-label={
                              showNewPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Confirm new password"
                  placeholder="Retype New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                  error={showPasswordError}
                  helperText={showPasswordError ? "Passwords do not match. Try again." : ""}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            edge="end"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
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
                disabled={!passwordsMatch || !!localPasswordError || isUpdatingPassword}
                onClick={handleUpdatePassword}
              >
                NEXT
              </Button>
            </>
          ),
        };

      case 3:
        return {
          body: (
            <Typography variant="body1">
              Your password has been successfully changed!
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
