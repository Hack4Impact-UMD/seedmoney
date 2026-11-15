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
  titleColor?: string;
};

export default function ConfirmEditModalShell({
  open,
  onClose,
  children,
  actions,
  title = "Confirm Edit",
  maxWidth = "sm",
  titleColor,
}: ConfirmEditModalShellProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-edit-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          m: { xs: 2, sm: 4 },
          width: {
            xs: "calc(100% - 32px)",
            sm: "calc(100% - 64px)",
          },
          maxHeight: { xs: "calc(100dvh - 32px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <DialogTitle id="confirm-edit-dialog-title" sx={{ m: 0, p: 2, pr: 6 }}>
        <Typography
          component="span"
          fontWeight={700}
          fontSize={{ xs: "1.125rem", sm: "1.25rem" }}
          color={titleColor}
        >
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
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          pb: actions ? 1 : { xs: 2, sm: 3 },
          overflowY: "auto",
          overflowX: "hidden",
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: { xs: 1, sm: 0 },
            "& > :not(style) ~ :not(style)": {
              ml: { xs: 0, sm: 1 },
            },
            "& .MuiButton-root": {
              whiteSpace: "nowrap",
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
