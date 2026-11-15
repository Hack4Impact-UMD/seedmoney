"use client";

import { useRef, useState } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import ConfirmEditModalShell from "./ConfirmEditModalShell";
import { createBrowserClient } from "@/src/lib/supabase-client";

export default function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const captcha = useRef<TurnstileInstance | undefined>(undefined);

  const close = () => { if (!inFlight.current) onClose(); };

  const sendRecoveryEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || !captchaToken || !email.trim()) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const { error } = await createBrowserClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });
      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Unable to send the recovery email. Please try again.");
    } finally {
      inFlight.current = false;
      setPending(false);
      setCaptchaToken(null);
      captcha.current?.reset();
    }
  };

  return (
    <ConfirmEditModalShell
      open
      onClose={close}
      title={sent ? "Check Your Email" : "Reset Password / Activate Account"}
      actions={sent ? (
        <Button variant="contained" onClick={close}>DONE</Button>
      ) : (
        <>
          <Button onClick={close} disabled={pending}>CANCEL</Button>
          <Button type="submit" form="password-recovery-form" variant="contained"
            disabled={pending || !captchaToken || !email.trim()}>
            {pending ? "SENDING..." : "SEND RECOVERY EMAIL"}
          </Button>
        </>
      )}
    >
      {sent ? (
        <Typography role="status">
          If an account exists for that email address, you will receive a link to set a new password.
          Check your inbox and spam folder.
        </Typography>
      ) : (
        <Box component="form" id="password-recovery-form" onSubmit={sendRecoveryEmail}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>Enter your account email address to receive a password recovery link.</Typography>
          <TextField label="Email address" type="email" autoComplete="email" required
            value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} fullWidth />
          <Turnstile id="password-recovery-captcha" ref={captcha} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)} />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      )}
    </ConfirmEditModalShell>
  );
}
