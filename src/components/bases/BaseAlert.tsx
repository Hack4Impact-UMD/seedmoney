import { Snackbar, Alert } from "@mui/material";
type BaseAlertProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  copySuccess?: boolean;
};

export default function BaseAlert({
  open,
  onClose,
  title,
  children,
  copySuccess = false,
}: BaseAlertProps) {
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
      <Alert
        variant="outlined"
        severity={copySuccess ? "success" : undefined}
        sx={
          copySuccess
            ? {
                borderRadius: "4px",
                padding: "6px 16px",
                alignItems: "flex-start",
                "& .MuiAlert-icon": {
                  fontSize: "22px",
                  marginRight: "12px",
                  padding: "7px 0",
                },
                "& .MuiAlert-message": {
                  padding: "8px 0",
                },
              }
            : undefined
        }
      >
        <p
          className={
            copySuccess
              ? "text-[16px] font-medium leading-6 tracking-[0.15px]"
              : "text-[16px]"
          }
        >
          {title}
        </p>
        <div
          className={
            copySuccess
              ? "mt-1 text-[14px] font-medium leading-5 tracking-[0.15px]"
              : "mt-[3px] text-[14px]"
          }
        >
          {children}
        </div>
      </Alert>
    </Snackbar>
  );
}
