"use client";

import { Alert } from "@mui/material";
import type {
  CampaignTransfer,
  OwnedCampaign,
} from "@/src/types/accountDeletion";

type DeletionConfirmationProps = {
  ownedCampaigns: OwnedCampaign[];
  transferredCampaigns: CampaignTransfer[];
  error: string | null;
};

export default function DeletionConfirmation({
  ownedCampaigns,
  transferredCampaigns,
  error,
}: DeletionConfirmationProps) {
  return (
    <div className="text-[16px] leading-[1.5] text-black">
      <p>
        This permanently deletes your SeedMoney account and can&apos;t be
        undone.
      </p>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <ul className="mt-6">
        {transferredCampaigns.map((transfer) => (
          <li key={transfer.id}>
            • <strong>{transfer.campaignName}:</strong> transferred
          </li>
        ))}
        {ownedCampaigns.map((campaign) => (
          <li key={campaign.campaign_id}>
            • <strong>{campaign.name || "Untitled Campaign"}:</strong> will be{" "}
            <strong>unpublished first</strong>.
          </li>
        ))}
        {ownedCampaigns.length > 0 && (
          <li>• Donations to these campaigns will stop.</li>
        )}
        <li>• Your name, email and login will be removed.</li>
      </ul>
      <p className="mt-6">You&apos;ll be signed out right away.</p>
    </div>
  );
}
