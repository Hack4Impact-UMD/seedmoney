"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, CircularProgress } from "@mui/material";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { useAuth } from "@/src/context/AuthProvider";
import useAccountDeletionOverview from "@/src/hooks/users/useAccountDeletionOverview";
import useDeleteOwnAccount from "@/src/hooks/users/useDeleteOwnAccount";
import BaseAlert from "@/src/components/bases/BaseAlert";
import CampaignTransferFlow from "@/src/components/campaign-transfers/CampaignTransferFlow";
import ManageTransferModal, {
  type TransferToast,
} from "@/src/components/campaign-transfers/ManageTransferModal";
import TransferStatusChip from "@/src/components/campaign-transfers/TransferStatusChip";
import ConfirmEditModalShell from "@/src/components/settings-modals/ConfirmEditModalShell";
import type {
  CampaignTransfer,
  OwnedCampaign,
} from "@/src/types/accountDeletion";
import DeletionConfirmation from "./DeletionConfirmation";

type DeleteAccountFlowProps = {
  open: boolean;
  onClose: () => void;
};

type Step = "overview" | "confirmation";

// A campaign the user still owns, or one they've transferred away.
type CampaignRow = {
  campaignId: number;
  name: string;
  campaign: OwnedCampaign | null;
  transfer: CampaignTransfer | null;
};

const TITLE_COLOR = "#123A1E";

// e.g. "Published: $130 raised"
function formatCampaignSummary(campaign: OwnedCampaign) {
  const raised = `$${(campaign.raised ?? 0).toLocaleString()} raised`;

  if (!campaign.status) return raised;

  const status = campaign.status.replaceAll("_", " ");
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}: ${raised}`;
}

function getRowSubtitle({ campaign, transfer }: CampaignRow) {
  if (transfer?.status === "accepted") {
    return `Now owned by ${transfer.recipientName ?? transfer.recipientEmail}`;
  }
  if (transfer?.status === "pending") {
    return `Invite sent to ${transfer.recipientEmail}`;
  }
  if (transfer?.status === "expired") {
    return `Invite to ${transfer.recipientEmail} expired`;
  }
  return campaign ? formatCampaignSummary(campaign) : "";
}

export default function DeleteAccountFlow({
  open,
  onClose,
}: DeleteAccountFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>("overview");
  const [transferCampaign, setTransferCampaign] =
    useState<OwnedCampaign | null>(null);
  const [managedRow, setManagedRow] = useState<CampaignRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<TransferToast | null>(null);
  const deleteInFlight = useRef(false);

  const overviewQuery = useAccountDeletionOverview(open);
  const deleteAccount = useDeleteOwnAccount();
  const overview = overviewQuery.data;
  const isDeleting = deleteAccount.isPending;

  const ownedCampaigns = overview?.ownedCampaigns ?? [];
  const transfers = overview?.transfers ?? [];
  const transfersByCampaignId = new Map(
    transfers.map((transfer) => [transfer.campaignId, transfer] as const),
  );
  const ownedRows: CampaignRow[] = ownedCampaigns.map((campaign) => ({
    campaignId: campaign.campaign_id,
    name: campaign.name,
    campaign,
    transfer: transfersByCampaignId.get(campaign.campaign_id) ?? null,
  }));
  // Transferred campaigns are no longer owned, so they come from transfers.
  const transferredRows: CampaignRow[] = transfers
    .filter((transfer) => transfer.status === "accepted")
    .map((transfer) => ({
      campaignId: transfer.campaignId,
      name: transfer.campaignName,
      campaign: null,
      transfer,
    }));
  const rows = [...ownedRows, ...transferredRows];
  const transferredCampaigns = transferredRows.map((row) => row.transfer!);
  // Deletion waits until pending invitations are accepted or cancelled.
  const hasPendingTransfer =
    transfers.some((transfer) => transfer.status === "pending") ||
    overview?.canDelete === false;

  const handleClose = () => {
    if (deleteInFlight.current || isDeleting) {
      return;
    }

    setStep("overview");
    setTransferCampaign(null);
    setManagedRow(null);
    setDeleteError(null);
    onClose();
  };

  const handleContinue = async () => {
    const fresh = await overviewQuery.refetch();

    if (fresh.error || !fresh.data || !fresh.data.canDelete) {
      return;
    }

    setDeleteError(null);
    setStep("confirmation");
  };

  const handleDelete = async () => {
    if (deleteInFlight.current || isDeleting) {
      return;
    }

    deleteInFlight.current = true;
    setDeleteError(null);

    try {
      const result = await deleteAccount.mutateAsync();

      if (!result.success) {
        setDeleteError(result.error);
        return;
      }

      const supabase = createBrowserClient();
      await supabase.auth
        .signOut({ scope: "local" })
        .catch(() => undefined);

      setUser(null);
      queryClient.clear();
      onClose();
      router.replace("/?accountDeleted=1");
      router.refresh();
    } catch {
      setDeleteError(
        "We couldn't reach the server. Your account is still active; please try again.",
      );
    } finally {
      deleteInFlight.current = false;
    }
  };

  const overviewActions = (
    <>
      <Button variant="text" size="medium" onClick={handleClose}>
        Cancel
      </Button>
      {hasPendingTransfer ? (
        <Button variant="contained" size="small" onClick={handleClose}>
          Done
        </Button>
      ) : (
        <Button
          variant="contained"
          size="small"
          onClick={handleContinue}
          disabled={
            overviewQuery.isPending ||
            overviewQuery.isError ||
            overviewQuery.isFetching
          }
        >
          {overviewQuery.isFetching && !overviewQuery.isPending
            ? "Checking..."
            : ownedCampaigns.length > 0
              ? "Skip transfer"
              : "Continue"}
        </Button>
      )}
    </>
  );

  const confirmationActions = (
    <>
      <Button
        variant="text"
        size="medium"
        onClick={() => {
          setDeleteError(null);
          setStep("overview");
        }}
        disabled={isDeleting}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={handleDelete}
        disabled={isDeleting}
        className="enabled:bg-[#D32F2F]! enabled:hover:bg-[#B71C1C]!"
      >
        {isDeleting ? (
          <span className="flex items-center gap-2">
            <CircularProgress size={14} sx={{ color: "#ffffff" }} />
            Deleting...
          </span>
        ) : (
          "Delete my account"
        )}
      </Button>
    </>
  );

  return (
    <>
      <ConfirmEditModalShell
        open={open}
        onClose={handleClose}
        title={
          step === "overview"
            ? "Before you delete your account"
            : "Delete your account?"
        }
        titleColor={TITLE_COLOR}
        actions={step === "overview" ? overviewActions : confirmationActions}
      >
        {overviewQuery.isPending && (
          <div className="flex items-center gap-3 py-6 text-[#666]">
            <CircularProgress size={20} sx={{ color: "#2D7A45" }} />
            <p className="text-[14px]">Loading your campaigns...</p>
          </div>
        )}

        {overviewQuery.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => overviewQuery.refetch()}>
                Retry
              </Button>
            }
          >
            We couldn&apos;t load your campaigns. Please try again.
          </Alert>
        )}

        {overview && step === "overview" && (
          <div className="flex flex-col gap-2">
            <p className="text-[16px] text-[#333]">
              Your campaigns need a new owner, or they&apos;ll be unpublished
              when your account is deleted.
            </p>

            {rows.length === 0 && (
              <p className="py-3 text-[14px] text-[#666]">
                You don&apos;t own any campaigns, so you can delete your
                account right away.
              </p>
            )}

            {rows.map((row) => (
              <div
                key={row.campaignId}
                className="flex items-center gap-3 rounded-[8px] px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="break-words text-[16px] font-bold text-[#142A19]">
                    {row.name || "Untitled Campaign"}
                  </p>
                  <p className="text-[14px] text-[#666]">
                    {getRowSubtitle(row)}
                  </p>
                </div>
                {row.transfer ? (
                  <TransferStatusChip
                    status={row.transfer.status}
                    onClick={
                      row.transfer.status === "accepted"
                        ? undefined
                        : () => setManagedRow(row)
                    }
                  />
                ) : (
                  row.campaign && (
                    <Button
                      variant="outlined"
                      size="small"
                      className="shrink-0"
                      onClick={() => setTransferCampaign(row.campaign)}
                    >
                      Transfer ownership
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {overview && step === "confirmation" && (
          <DeletionConfirmation
            ownedCampaigns={ownedCampaigns}
            transferredCampaigns={transferredCampaigns}
            error={deleteError}
          />
        )}
      </ConfirmEditModalShell>

      {open && transferCampaign && (
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

      {open && managedRow?.transfer && (
        <ManageTransferModal
          transfer={managedRow.transfer}
          campaignName={managedRow.name}
          onClose={() => setManagedRow(null)}
          onDone={setToast}
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
    </>
  );
}
