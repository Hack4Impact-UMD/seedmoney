"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import {
  useCampaignNote,
  useSaveCampaignNote,
} from "@/src/hooks/campaigns/useCampaignNote";

type AdminNotesCardProps = {
  campaignId: number;
  onSaved: () => void;
  onError: (message: string) => void;
};

// Admin-only note. It saves on its own so it never marks the campaign form dirty.
export default function AdminNotesCard({
  campaignId,
  onSaved,
  onError,
}: AdminNotesCardProps) {
  const { data: savedNote, isLoading } = useCampaignNote(campaignId);
  const saveNote = useSaveCampaignNote();
  // null means "no unsaved edits": show whatever is saved.
  const [draftNote, setDraftNote] = useState<string | null>(null);

  const savedText = savedNote?.note ?? "";
  const note = draftNote ?? savedText;
  const isDirty = draftNote !== null && draftNote.trim() !== savedText;

  const handleSave = async () => {
    try {
      await saveNote.mutateAsync({ campaignId, note });
      setDraftNote(null);
      onSaved();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to save note");
    }
  };

  return (
    <div className="rounded-2xl border border-[#2D7A45] bg-white p-6">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-[#2D7A45]">
        Admin Notes <LockIcon fontSize="small" />
      </h3>
      <TextField
        variant="standard"
        label="Only visible to admins"
        placeholder={isLoading ? "Loading..." : "Add a note about this application"}
        multiline
        fullWidth
        value={note}
        onChange={(e) => setDraftNote(e.target.value)}
        disabled={isLoading}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { maxLength: 2000 },
        }}
        sx={{ mt: 2 }}
      />
      {isDirty && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="text"
            size="small"
            onClick={() => setDraftNote(null)}
            disabled={saveNote.isPending}
          >
            DISCARD
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saveNote.isPending}
          >
            {saveNote.isPending ? "..." : "SAVE NOTE"}
          </Button>
        </div>
      )}
    </div>
  );
}
