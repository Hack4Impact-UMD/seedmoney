"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getOwnedCampaigns } from "@/src/actions/db/account-deletion";

type DeleteAccountFlowProps = {
  open: boolean;
  onClose: () => void;
};


export default function DeleteAccountFlow({ open, onClose }: DeleteAccountFlowProps) {
  const [step, setStep] = useState<"overview" | "confirmation">("overview");

  const {
    data: campaigns = [],
    isPending,
    isError
  } = useQuery({
    queryKey: ["owned-campaigns"],
    queryFn: getOwnedCampaigns,
    enabled: open
  });

  const handleClose = () => {
    setStep("overview");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {step === "overview" ? "Before you delete your account" : "Delete your account"}
      </DialogTitle>

      <DialogContent>
        {step === "overview" && (
          <div>
            <p>Your campaigns can be transferred to a new owner, or they&apos;ll be unpublished when your account is deleted.</p>

            {isPending && <p>Loading campaigns...</p>}

            {isError && <p>Unable to load campaigns.</p>}

            {!isPending && !isError && campaigns.length === 0 && (
              <p>You don&apos;t currently own any campaigns.</p>
            )}

            {!isPending && !isError && campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="my-4">
                <p className="font-semibold">{campaign.name}</p>
                <p>{campaign.status}: {campaign.raised > 0 ? `$${campaign.raised.toLocaleString()} raised` : ""}</p>
                 {/* TODO: Connect Vishal's CampaignTransferFlow */}
                <Button variant="outlined" disabled>
                  Transfer
                </Button>
              </div>
            ))}
          </div>
        )}

        {step === "confirmation" && (
          <div>
            <p>This permanently deletes your SeedMoney account and can&apos;t be undone.</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              {campaigns.map((campaign) => 
                <li key={campaign.campaign_id}>
                  <strong>{campaign.name}:</strong> will be <strong>unpublished first.</strong>
                </li>
              )}
              <li>Donations to these campaigns will stop.</li>
              <li>Your name, email, and login will be removed.</li>
            </ul>
            <p className="mt-5">You&apos;ll be signed out right away.</p>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        {step === "overview" ? (
          <Button
            onClick={() => setStep("confirmation")}
            disabled={isPending || isError}
          >
            {campaigns.length > 0 ? "Skip Transfers" : "Continue"}
          </Button>
        ) : (
          // TODO: actual delete implementation will go here later
          <Button color="error" disabled>
            Delete Account
          </Button>
        )}
      </DialogActions>

    </Dialog>
  )
}