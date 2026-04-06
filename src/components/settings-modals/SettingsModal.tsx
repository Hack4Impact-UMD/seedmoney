"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import type { Users } from "@/src/types/db/users";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  userData: Users | undefined;
  onEditName: () => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
};

function SettingsRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <Box py={2}>
      <Typography fontWeight={700} fontSize="0.95rem">
        {label}
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 0.5 }}
      >
        <Typography color="#888" fontSize="0.95rem" sx={{ mr: 4 }}>
          {value}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onEdit}
          sx={{
            color: "#2E7D32",
            borderColor: "#2E7D32",
            "&:hover": { borderColor: "#1B5E20", color: "#1B5E20" },
          }}
        >
          EDIT
        </Button>
      </Box>
    </Box>
  );
}

export default function SettingsModal({
  open,
  onClose,
  userData,
  onEditName,
  onEditEmail,
  onEditPassword,
}: SettingsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ m: 0, p: 2, pl: 3, pr: 6 }}>
        <Typography component="span" fontWeight={700} fontSize="1.25rem">
          Settings
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <SettingsRow
          label="Name"
          value={`${userData?.first_name || "John"} ${userData?.last_name || "Smith"}`}
          onEdit={onEditName}
        />
        <SettingsRow
          label="Email"
          value={userData?.email || "johnsmith@gmail.com"}
          onEdit={onEditEmail}
        />
        <SettingsRow
          label="Password"
          value="••••••••••••••••••"
          onEdit={onEditPassword}
        />
      </DialogContent>
    </Dialog>
  );
}
