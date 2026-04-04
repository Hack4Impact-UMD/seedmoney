"use client";

import { useState, useEffect } from "react";
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
  onSave?: (firstName: string, lastName: string) => void;
  firstName: string;
  lastName: string;
};

export default function ChangeNameModal({
  open,
  onClose,
  onSave,
  firstName,
  lastName,
}: ChangeNameModalProps) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);

  useEffect(() => {
    if (open) {
      setFirst(firstName);
      setLast(lastName);
    }
  }, [open, firstName, lastName]);

  const isUnchanged = first === firstName && last === lastName;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography component="span" fontWeight={700} fontSize="1.25rem">
          Change Name
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" size="medium" onClick={onClose}>
          CANCEL
        </Button>
        <Button
          variant="contained"
          size="medium"
          disabled={isUnchanged}
          onClick={() => {
            onSave?.(first, last);
            onClose();
          }}
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
