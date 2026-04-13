import { Snackbar, Alert } from "@mui/material";
type BaseAlertProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function BaseAlert({ open, onClose, title, children }: BaseAlertProps) {
  return (
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          onClose();
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
      <Alert variant="outlined">
        <p className ="text-[16px]">{title}</p>
        <div className = "mt-[3px] text-[14px]">
          {children}
        </div>
      </Alert>
    </Snackbar>
  );
}