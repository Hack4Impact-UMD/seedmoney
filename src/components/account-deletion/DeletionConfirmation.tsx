"use client";

import { Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type {
  CampaignTransfer,
  OwnedCampaign,
} from "@/src/types/accountDeletion";

type DeletionConfirmationProps = {
  ownedCampaigns: OwnedCampaign[];
  transferredCampaigns: CampaignTransfer[];
  error: string | null;
};

const CHECK_ICON_SX = {
  fontSize: 18,
  color: "#2E7D32",
  mt: "2px",
  flexShrink: 0,
};

function campaignLabel(campaign: OwnedCampaign) {
  return campaign.name || "Untitled Campaign";
}

export default function DeletionConfirmation({
  ownedCampaigns,
  transferredCampaigns,
  error,
}: DeletionConfirmationProps) {
  const hasTransfers = transferredCampaigns.length > 0;
  const hasRetained = ownedCampaigns.length > 0;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-[#5f6b63]">
        This action cannot be undone. Please review the following:
      </p>

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: "10px", fontSize: 14 }}
        >
          {error}
        </Alert>
      )}

      <ul className="space-y-4">
        <li className="flex gap-3">
          <CheckCircleIcon sx={CHECK_ICON_SX} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1f2320]">
              {hasTransfers
                ? `${transferredCampaigns.length} ${
                    transferredCampaigns.length === 1
                      ? "campaign has"
                      : "campaigns have"
                  } been transferred`
                : "No campaigns were transferred"}
            </p>

            {hasTransfers ? (
              <ul className="mt-1 space-y-0.5 text-sm text-[#5f6b63]">
                {transferredCampaigns.map((transfer) => (
                  <li key={transfer.id} className="break-words">
                    {transfer.campaignName} → {transfer.recipientEmail}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-0.5 text-sm text-[#7b827d]">
                You didn&apos;t transfer any campaigns.
              </p>
            )}
          </div>
        </li>

        <li className="flex gap-3">
          <CheckCircleIcon sx={CHECK_ICON_SX} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1f2320]">
              {hasRetained
                ? `${ownedCampaigns.length} owned ${
                    ownedCampaigns.length === 1 ? "campaign" : "campaigns"
                  } will be unpublished`
                : "No campaigns will be unpublished"}
            </p>

            {hasRetained ? (
              <>
                <ul className="mt-1 space-y-0.5 text-sm text-[#5f6b63]">
                  {ownedCampaigns.map((campaign) => (
                    <li key={campaign.campaign_id} className="break-words">
                      {campaignLabel(campaign)}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-[#7b827d]">
                  They will be kept for admin recovery, including their
                  content and photos.
                </p>
              </>
            ) : (
              <p className="mt-0.5 text-sm text-[#7b827d]">
                You don&apos;t own any campaigns.
              </p>
            )}
          </div>
        </li>

        <li className="flex gap-3">
          <CheckCircleIcon sx={CHECK_ICON_SX} />
          <p className="text-sm text-[#5f6b63]">
            Your profile and login will be permanently deleted.
          </p>
        </li>

        <li className="flex gap-3">
          <CheckCircleIcon sx={CHECK_ICON_SX} />
          <p className="text-sm text-[#5f6b63]">
            You will be signed out.
          </p>
        </li>
      </ul>

      <p className="text-xs font-semibold text-[#5f6b63]">
        This action cannot be undone.
      </p>
    </div>
  );
}