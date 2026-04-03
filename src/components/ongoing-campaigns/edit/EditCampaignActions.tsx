"use client";

import { Button } from "@mui/material";

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
    <div className="w-32 flex flex-col gap-3 pt-1">
      <Button variant="contained" disabled={!isFormDirty} onClick={onSave}>
        Save
      </Button>
      <Button variant="outlined" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
