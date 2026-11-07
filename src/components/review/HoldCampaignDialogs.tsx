"use client";

import { useState } from "react";
import { Button, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BaseModal from "@/src/components/bases/BaseModal";
import {
  useCampaignNote,
  useHoldCampaign,
} from "@/src/hooks/campaigns/useCampaignNote";

const NOTE_MAX_LENGTH = 2000;

type HoldCampaignDialogsProps = {
  open: boolean;
  campaignId: number | null;
  campaignTitle: string;
  onClose: () => void;
  onHeld: () => void;
  onError: (message: string) => void;
};

// Two-step hold flow: "Confirm Hold" and then "Add a note (optional)".
// The flow mounts fresh each time it opens, so its state always starts clean.
export default function HoldCampaignDialogs(props: HoldCampaignDialogsProps) {
  const { open, campaignId } = props;
  if (!open || !campaignId) return null;
  return <HoldCampaignFlow key={campaignId} {...props} campaignId={campaignId} />;
}

function HoldCampaignFlow({
  campaignId,
  campaignTitle,
  onClose,
  onHeld,
  onError,
}: HoldCampaignDialogsProps & { campaignId: number }) {
  const [step, setStep] = useState<"confirm" | "note">("confirm");
  // null until the admin types, so an existing note is shown as the default.
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const holdCampaign = useHoldCampaign();
  const { data: existingNote } = useCampaignNote(campaignId);

  const note = draftNote ?? existingNote?.note ?? "";

  const handleClose = () => {
    if (holdCampaign.isPending) return;
    onClose();
  };

  const handlePutOnHold = async () => {
    try {
      await holdCampaign.mutateAsync({ campaignId, note });
      onHeld();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to place campaign on hold",
      );
    }
  };

  const header = (title: string) => (
    <div className="mb-4 flex items-start justify-between">
      <h2 className="text-xl font-semibold text-[#123A1E]">{title}</h2>
      <IconButton aria-label="Close" onClick={handleClose} size="small">
        <CloseIcon />
      </IconButton>
    </div>
  );

  return (
    <BaseModal open onClose={handleClose}>
      {step === "confirm" ? (
        <>
          {header("Confirm Hold")}
          <div className="flex flex-col gap-2 text-[#666666]">
            <p>You are about to hold this campaign:</p>
            <ul className="list-disc pl-6 text-[#123A1E]">
              <li>{campaignTitle}</li>
            </ul>
            <p>Are you sure you would like to hold?</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="text" size="small" onClick={handleClose}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setStep("note")}
            >
              CONFIRM
            </Button>
          </div>
        </>
      ) : (
        <>
          {header("Add a note (optional)")}
          <p className="mb-4 text-[#666666]">
            Add an internal note explaining why this application is being placed
            on hold. Notes are only visible to admins and can be edited later.
          </p>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setDraftNote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: NOTE_MAX_LENGTH } }}
          />
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="text"
              size="small"
              onClick={handleClose}
              disabled={holdCampaign.isPending}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handlePutOnHold}
              disabled={holdCampaign.isPending}
            >
              {holdCampaign.isPending ? "..." : "PUT ON HOLD"}
            </Button>
          </div>
        </>
      )}
    </BaseModal>
  );
}
