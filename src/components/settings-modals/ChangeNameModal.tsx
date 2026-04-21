"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";

type ChangeNameModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (firstName: string, lastName: string) => Promise<boolean>;
  firstName: string;
  lastName: string;
  title?: string;
  saveError?: string | null;
  isSaving?: boolean;
};

export default function ChangeNameModal({
  open,
  onClose,
  onSave,
  firstName,
  lastName,
  title = "Change Name",
  saveError = null,
  isSaving = false,
}: ChangeNameModalProps) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);

  const isDisabled =
    isSaving ||
    !first.trim() ||
    !last.trim() ||
    (first.trim() === firstName.trim() && last.trim() === lastName.trim());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography component="span" fontWeight={700} fontSize="1.25rem">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSaving}
          sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5} sx={{ pt: 1 }}>
          <TextField
            variant="outlined"
            fullWidth
            label="First Name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
          <TextField
            variant="outlined"
            fullWidth
            label="Last Name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
          {saveError && (
            <Typography color="error" variant="body2">
              {saveError}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" size="medium" onClick={onClose} disabled={isSaving}>
          CANCEL
        </Button>
        <Button
          variant="contained"
          size="medium"
          disabled={isDisabled}
          onClick={async () => {
            await onSave?.(first.trim(), last.trim());
          }}
        >
          {isSaving ? "SAVING..." : "SAVE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
