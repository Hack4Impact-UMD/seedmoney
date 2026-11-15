"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertTitle, Snackbar } from "@mui/material";

// Codes /transfer/accept puts in ?transferError=.
const MESSAGES: Record<string, string> = {
  not_found:
    "This transfer link isn't valid. Ask the campaign leader to send a new invitation.",
  invalid:
    "This transfer link isn't valid. Ask the campaign leader to send a new invitation.",
  expired:
    "This invitation has expired. Ask the campaign leader to resend it.",
  cancelled: "The campaign leader canceled this invitation.",
  already_accepted: "This invitation has already been accepted.",
  email_mismatch:
    "This invitation was sent to a different email. Sign in with that email and open the link again.",
  profile_missing:
    "Finish setting up your account, then open the link again.",
};
const FALLBACK_MESSAGE =
  "Something went wrong accepting the transfer. Try opening the link again.";

// Lives in the dashboard layout so it survives /dashboard redirecting to a campaign.
export default function TransferErrorAlert() {
  const searchParams = useSearchParams();
  const code = searchParams.get("transferError");
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [seenCode, setSeenCode] = useState<string | null>(null);

  // Keep the code in state; /dashboard may redirect away and drop the param.
  if (code && code !== seenCode) {
    setSeenCode(code);
    setShownCode(code);
  } else if (!code && seenCode) {
    // Lets the same error show again if another failed link is opened later.
    setSeenCode(null);
  }

  useEffect(() => {
    if (!code) return;

    // Drop the param so a refresh doesn't show the alert again.
    const url = new URL(window.location.href);
    url.searchParams.delete("transferError");
    window.history.replaceState(null, "", url);
  }, [code]);

  return (
    <Snackbar
      open={!!shownCode}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={(_, reason) => {
        if (reason !== "clickaway") setShownCode(null);
      }}
    >
      <Alert
        severity="error"
        onClose={() => setShownCode(null)}
        sx={{ maxWidth: 400 }}
      >
        <AlertTitle>Couldn&apos;t accept transfer</AlertTitle>
        {(shownCode && MESSAGES[shownCode]) ?? FALLBACK_MESSAGE}
      </Alert>
    </Snackbar>
  );
}
