"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import ChangePasswordModal from "@/src/components/settings-modals/ChangePasswordModal";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { verifyPasswordRecovery } from "@/src/lib/passwordRecovery";

const INVALID_LINK =
  "This password reset link is invalid or has expired. Please request a new password recovery email.";

export default function ResetPasswordPage() {
  const verification = useRef<Promise<boolean> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;

    // Reuse the same verification during Strict Mode's effect replay: links are single-use.
    if (!verification.current) {
      const url = new URL(window.location.href);
      verification.current = (async () => {
        try {
          return await verifyPasswordRecovery(createBrowserClient(), url);
        } finally {
          window.history.replaceState(window.history.state, "", "/reset-password");
        }
      })();
    }

    verification.current.then(
      (verified) => {
        if (!active) return;
        if (verified) setReady(true);
        else setError(INVALID_LINK);
      },
      () => {
        if (active) setError("Unable to verify the reset link. Please try opening the email link again.");
      },
    );

    return () => { active = false; };
  }, []);

  const returnToLogin = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      const { error } = await createBrowserClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      window.location.replace("/");
    } catch {
      setReady(false);
      setError("Unable to sign out. Please try again to return to login.");
      setLeaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl">Reset your password</h1>
        {error ? (
          <p role="alert" className="mb-4 text-red-600">{error}</p>
        ) : !ready ? (
          <p role="status">Verifying your reset link...</p>
        ) : null}
        {(error || ready) && (
          <Button onClick={returnToLogin} disabled={leaving}>Return to login</Button>
        )}
      </div>
      {ready && (
        <ChangePasswordModal
          open
          recovery
          onClose={() => { void returnToLogin(); }}
          onLogin={() => { void returnToLogin(); }}
        />
      )}
    </main>
  );
}
