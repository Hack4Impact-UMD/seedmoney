"use client";

import {Button} from "@mui/material";

interface EditCampaignActionsProps {
  isFormDirty: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditCampaignActions({
  isFormDirty,
  onSave,
  onCancel,
}: EditCampaignActionsProps) {
  return (
    <div className="w-full md:w-32 flex flex-row md:flex-col gap-3 pt-1">
      <Button
        variant="contained"
        disabled={!isFormDirty}
        onClick={onSave}
        className="flex-1 md:flex-none"
      >
        SAVE
      </Button>
      <Button
        variant="outlined"
        onClick={onCancel}
        className="flex-1 md:flex-none"
      >
        CANCEL
      </Button>
    </div>
  );
}
