"use client";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface EmailStatusToastProps {
  open: boolean;
  onClose: () => void;
  severity: "success" | "error";
  title: string;
  children?: React.ReactNode;
}

export default function EmailStatusToast({
  open,
  onClose,
  severity,
  title,
  children,
}: EmailStatusToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={(_, reason) => {
        if (reason !== "clickaway") onClose();
      }}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={severity} onClose={onClose} sx={{ width: "100%" }}>
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-0.5 text-sm">{children}</p>}
      </Alert>
    </Snackbar>
  );
}
