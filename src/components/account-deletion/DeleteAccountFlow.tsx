"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@mui/material";
import { getOwnedCampaigns } from "@/src/actions/db/account-deletion";
import BaseAlert from "@/src/components/bases/BaseAlert";
import CampaignTransferFlow from "@/src/components/campaign-transfers/CampaignTransferFlow";
import ConfirmEditModalShell from "@/src/components/settings-modals/ConfirmEditModalShell";
import type { OwnedCampaign } from "@/src/types/accountDeletion";

type DeleteAccountFlowProps = {
  open: boolean;
  onClose: () => void;
};

const TITLE_COLOR = "#123A1E";

// e.g. "Published: $130 raised"
function formatCampaignSummary(campaign: OwnedCampaign) {
  const raised = `$${(campaign.raised ?? 0).toLocaleString()} raised`;

  if (!campaign.status) return raised;

  const status = campaign.status.replaceAll("_", " ");
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}: ${raised}`;
}

export default function DeleteAccountFlow({ open, onClose }: DeleteAccountFlowProps) {
  const [step, setStep] = useState<"overview" | "confirmation">("overview");
  const [transferCampaign, setTransferCampaign] =
    useState<OwnedCampaign | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );

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

  const actions =
    step === "overview" ? (
      <>
        <Button variant="text" size="medium" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => setStep("confirmation")}
          disabled={isPending || isError}
        >
          {campaigns.length > 0 ? "Skip transfer" : "Continue"}
        </Button>
      </>
    ) : (
      <>
        <Button variant="text" size="medium" onClick={handleClose}>
          Cancel
        </Button>
        {/* TODO: actual delete implementation will go here later */}
        <Button
          variant="contained"
          size="small"
          disabled
          sx={{
            backgroundColor: "#D32F2F",
            "&:hover": { backgroundColor: "#B71C1C" },
          }}
        >
          Delete my account
        </Button>
      </>
    );

  return (
    <ConfirmEditModalShell
      open={open}
      onClose={handleClose}
      title={
        step === "overview"
          ? "Before you delete your account"
          : "Delete your account?"
      }
      titleColor={TITLE_COLOR}
      actions={actions}
    >
      {step === "overview" && (
        <div className="flex flex-col gap-2">
          <p className="text-[16px] text-[#333]">
            Your campaigns need a new owner, or they&apos;ll be unpublished when
            your account is deleted.
          </p>

          {isPending && <p className="text-[#666]">Loading campaigns...</p>}

          {isError && <p className="text-[#D32F2F]">Unable to load campaigns.</p>}

          {!isPending && !isError && campaigns.map((campaign) => (
            <div
              key={campaign.campaign_id}
              className="flex items-center gap-3 rounded-[8px] px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[16px] font-bold text-[#142A19]">
                  {campaign.name}
                </p>
                <p className="text-[14px] text-[#666]">
                  {formatCampaignSummary(campaign)}
                </p>
              </div>
              <Button
                variant="outlined"
                size="small"
                className="shrink-0"
                onClick={() => setTransferCampaign(campaign)}
              >
                Transfer ownership
              </Button>
            </div>
          ))}
        </div>
      )}

      {step === "confirmation" && (
        <div className="text-[16px] leading-[1.5] text-black">
          <p>This permanently deletes your SeedMoney account and can&apos;t be undone.</p>
          <ul className="mt-6">
            {campaigns.map((campaign) => (
              <li key={campaign.campaign_id}>
                • <strong>{campaign.name}:</strong> will be{" "}
                <strong>unpublished first</strong>.
              </li>
            ))}
            {campaigns.length > 0 && (
              <li>• Donations to these campaigns will stop.</li>
            )}
            <li>• Your name, email and login will be removed.</li>
          </ul>
          <p className="mt-6">You&apos;ll be signed out right away.</p>
        </div>
      )}

      {transferCampaign && (
        <CampaignTransferFlow
          campaignId={transferCampaign.campaign_id}
          campaignName={transferCampaign.name}
          onCancel={() => setTransferCampaign(null)}
          onInvitationSent={(emailSent) => {
            setTransferCampaign(null);
            setToast(
              emailSent
                ? {
                    title: "Invitation sent",
                    message: "We emailed the recipient.",
                  }
                : {
                    title: "Invitation saved",
                    message:
                      "The invitation was saved, but the email couldn't be sent. Try resending it.",
                  },
            );
          }}
        />
      )}

      <BaseAlert
        open={!!toast}
        onClose={() => setToast(null)}
        title={toast?.title}
        copySuccess
      >
        {toast?.message}
      </BaseAlert>
    </ConfirmEditModalShell>
  )
}
