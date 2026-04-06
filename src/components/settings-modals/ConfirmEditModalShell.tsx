"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import type { DialogProps } from "@mui/material/Dialog";

type ConfirmEditModalShellProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  maxWidth?: DialogProps["maxWidth"];
};

export default function ConfirmEditModalShell({
  open,
  onClose,
  children,
  actions,
  title = "Confirm Edit",
  maxWidth = "sm",
}: ConfirmEditModalShellProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-edit-dialog-title"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle id="confirm-edit-dialog-title" sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography component="span" fontWeight={700} fontSize="1.25rem">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ px: 3, pt: 3, pb: actions ? 1 : 3, overflow: "visible" }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 2 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
}
