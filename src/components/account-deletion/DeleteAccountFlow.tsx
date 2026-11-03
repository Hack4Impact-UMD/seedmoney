"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { useAuth } from "@/src/context/AuthProvider";
import useAccountDeletionOverview from "@/src/hooks/users/useAccountDeletionOverview";
import useDeleteOwnAccount from "@/src/hooks/users/useDeleteOwnAccount";
import type {
  CampaignTransferFlowProps,
  OwnedCampaign,
} from "@/src/types/accountDeletion";
import DeletionConfirmation from "./DeletionConfirmation";

const PRIMARY_GREEN = "#2E7D32";
const PRIMARY_GREEN_DARK = "#1B5E20";

type DeleteAccountFlowProps = {
  open: boolean;
  onClose: () => void;
  TransferFlow?: ComponentType<CampaignTransferFlowProps>;
};

type Step = "overview" | "confirmation";

const PRIMARY_BUTTON_SX = {
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  py: 1,
  boxShadow: "none",
};

const SECONDARY_BUTTON_SX = {
  textTransform: "none",
  fontWeight: 600,
  color: "#4b5563",
  borderRadius: "8px",
  px: 2.5,
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    in_progress: "Draft",
    pending: "Pending review",
    approved: "Approved",
    denied: "Denied",
    published: "Published",
    suspended: "Unpublished",
    publish_failed: "Publish failed",
    archived: "Archived",
  };

  return labels[status] ?? status.replace(/_/g, " ");
}

export default function DeleteAccountFlow({
  open,
  onClose,
  TransferFlow,
}: DeleteAccountFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>("overview");
  const [transferCampaign, setTransferCampaign] = useState<OwnedCampaign | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInFlight = useRef(false);

  const overviewQuery = useAccountDeletionOverview(open);
  const deleteAccount = useDeleteOwnAccount();
  const overview = overviewQuery.data;

  const pendingTransfers =
    overview?.transfers.filter(
      (transfer) => transfer.status === "pending",
    ) ?? [];
  const transferredCampaigns =
    overview?.transfers.filter(
      (transfer) => transfer.status === "accepted",
    ) ?? [];
  const ownedCampaigns = overview?.ownedCampaigns ?? [];
  const pendingByCampaignId = new Map(
    pendingTransfers.map(
      (transfer) => [transfer.campaignId, transfer] as const,
    ),
  );
  const isBlocked =
    pendingTransfers.length > 0 || overview?.canDelete === false;
  const isDeleting = deleteAccount.isPending;

  useEffect(() => {
    if (!open) {
      setStep("overview");
      setTransferCampaign(null);
      setDeleteError(null);
    }
  }, [open]);

  const handleClose = () => {
    if (deleteInFlight.current || isDeleting) {
      return;
    }

    setStep("overview");
    setTransferCampaign(null);
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

  const handleInvitationChanged = async () => {
    setTransferCampaign(null);
    await overviewQuery.refetch();
  };

  return (
    <>
      <Dialog
        open={open && !transferCampaign}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: "24px 24px 8px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#1f2320",
            }}
          >
            {step === "overview"
              ? "Before you delete your account"
              : "Delete your account?"}
          </Typography>

          <IconButton
            aria-label="Close"
            onClick={handleClose}
            disabled={isDeleting}
            sx={{
              mt: "-6px",
              mr: "-8px",
              color: "#7b827d",
              "&:hover": { backgroundColor: "#f3f7f4" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: "24px",
            py: "8px",
            maxHeight: "65vh",
            overflowY: "auto",
          }}
        >
          {overviewQuery.isPending && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 6,
                color: "#5f6b63",
              }}
            >
              <CircularProgress size={20} sx={{ color: PRIMARY_GREEN }} />
              <Typography sx={{ fontSize: 14 }}>
                Loading your campaigns...
              </Typography>
            </Box>
          )}

          {overviewQuery.isError && (
            <Alert
              severity="error"
              sx={{ borderRadius: "10px", fontSize: 14 }}
              action={
                <Button
                  size="small"
                  onClick={() => overviewQuery.refetch()}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Retry
                </Button>
              }
            >
              We couldn&apos;t load your campaigns. Please try again.
            </Alert>
          )}

          {overview && step === "overview" && (
            <div>
              <p className="text-sm leading-6 text-[#5f6b63]">
                Choose which campaigns to transfer. Any campaign you
                don&apos;t transfer will be unpublished and kept for admin
                recovery before your account is deleted.
              </p>

              {ownedCampaigns.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#dfe8df] bg-[#f8fbf8] px-5 py-6 text-center">
                  <p className="text-sm font-semibold text-[#1f2320]">
                    No campaigns to transfer
                  </p>
                  <p className="mt-1 text-sm text-[#7b827d]">
                    {pendingTransfers.length > 0
                      ? "You don't own any campaigns, but you have pending invitations to resolve before deleting your account."
                      : "You don't own any campaigns, so you can delete your account right away."}
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  {ownedCampaigns.map((campaign, index) => {
                    const pendingTransfer = pendingByCampaignId.get(
                      campaign.campaign_id,
                    );

                    return (
                      <div key={campaign.campaign_id}>
                        {index > 0 && (
                          <Divider sx={{ borderColor: "#edf1ee" }} />
                        )}

                        <div className="flex items-center justify-between gap-4 py-4">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-[#1f2320]">
                              {campaign.name || "Untitled Campaign"}
                            </p>
                            <p className="mt-0.5 text-xs text-[#7b827d]">
                              {statusLabel(campaign.status)}
                              {campaign.raised > 0
                                ? ` · $${campaign.raised.toLocaleString()} raised`
                                : ""}
                            </p>
                          </div>

                          {pendingTransfer ? (
                            <div className="shrink-0 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (TransferFlow) {
                                    setTransferCampaign(campaign);
                                  }
                                }}
                                disabled={!TransferFlow}
                                title={
                                  TransferFlow
                                    ? "Manage this invitation"
                                    : undefined
                                }
                                className="rounded-full border border-[#f0c27a] bg-[#fff7e8] px-3 py-1 text-xs font-semibold text-[#a86a00] disabled:cursor-default"
                              >
                                Pending
                              </button>
                              <p
                                className="mt-1 max-w-[150px] truncate text-[10px] text-[#7b827d]"
                                title={pendingTransfer.recipientEmail}
                              >
                                {pendingTransfer.recipientEmail}
                              </p>
                            </div>
                          ) : TransferFlow ? (
                            <Button
                              variant="outlined"
                              onClick={() =>
                                setTransferCampaign(campaign)
                              }
                              disabled={isDeleting}
                              sx={{
                                flexShrink: 0,
                                borderRadius: "8px",
                                borderColor: PRIMARY_GREEN,
                                color: PRIMARY_GREEN,
                                textTransform: "none",
                                fontSize: 12,
                                fontWeight: 600,
                                px: 2,
                                py: 0.75,
                                whiteSpace: "nowrap",
                                "&:hover": {
                                  borderColor: PRIMARY_GREEN_DARK,
                                  backgroundColor: "#f1f8f2",
                                },
                              }}
                            >
                              Select to transfer
                            </Button>
                          ) : (
                            <span className="shrink-0 text-xs text-[#7b827d]">
                              Will be unpublished
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pendingTransfers.length > 0 && (
                <div className="mt-2 flex items-start justify-between gap-3 rounded-lg bg-[#fff7e8] px-3 py-2">
                  <p className="text-xs leading-5 text-[#8a5a00]">
                    Accept or cancel pending invitations before
                    continuing.
                  </p>
                  <button
                    type="button"
                    onClick={() => overviewQuery.refetch()}
                    className="shrink-0 text-xs font-semibold text-[#8a5a00] underline"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {overview && step === "confirmation" && (
            <DeletionConfirmation
              ownedCampaigns={ownedCampaigns}
              transferredCampaigns={transferredCampaigns}
              error={deleteError}
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: "24px",
            pb: "20px",
            pt: "12px",
            gap: 1,
          }}
        >
          {step === "overview" ? (
            <>
              <Button onClick={handleClose} sx={SECONDARY_BUTTON_SX}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleContinue}
                disabled={
                  overviewQuery.isPending ||
                  overviewQuery.isError ||
                  overviewQuery.isFetching ||
                  isBlocked ||
                  isDeleting
                }
                sx={{
                  ...PRIMARY_BUTTON_SX,
                  backgroundColor: PRIMARY_GREEN,
                  "&:hover": { backgroundColor: PRIMARY_GREEN_DARK },
                  "&.Mui-disabled": {
                    backgroundColor: "#cfe0d2",
                    color: "#ffffff",
                  },
                }}
              >
                {overviewQuery.isFetching && !overviewQuery.isPending
                  ? "Checking..."
                  : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setDeleteError(null);
                  setStep("overview");
                }}
                disabled={isDeleting}
                sx={SECONDARY_BUTTON_SX}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                disabled={isDeleting}
                sx={{
                  ...PRIMARY_BUTTON_SX,
                  backgroundColor: "#D32F2F",
                  "&:hover": { backgroundColor: "#B71C1C" },
                  "&.Mui-disabled": {
                    backgroundColor: "#efc4c4",
                    color: "#ffffff",
                  },
                }}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress
                      size={14}
                      sx={{ color: "#ffffff" }}
                    />
                    Deleting...
                  </span>
                ) : (
                  "Yes, delete"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {open && TransferFlow && transferCampaign && (
        <TransferFlow
          campaignId={transferCampaign.campaign_id}
          onInvitationSent={handleInvitationChanged}
          onCancel={() => setTransferCampaign(null)}
        />
      )}
    </>
  );
}