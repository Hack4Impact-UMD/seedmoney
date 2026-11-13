import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import BaseModal from "@/src/components/bases/BaseModal";

export type ExportStep = "closed" | "confirm" | "preparing" | "ready" | "error";

type ExportDialogProps = {
  step: ExportStep;
  confirmTitle: string;
  confirmMessage: string;
  successMessage: string;
  onConfirm: () => void;
  onClose: () => void;
};

const primaryButtonSx = {
  bgcolor: "#2D7A45",
  fontWeight: 700,
  "&:hover": { bgcolor: "#123A1E" },
};

const cancelButtonSx = { color: "#666666", fontWeight: 700 };

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <IconButton
      aria-label="Close"
      onClick={onClose}
      className="!absolute right-3 top-3"
    >
      <CloseIcon />
    </IconButton>
  );
}

export default function ExportDialog({
  step,
  confirmTitle,
  confirmMessage,
  successMessage,
  onConfirm,
  onClose,
}: ExportDialogProps) {
  return (
    <BaseModal open={step !== "closed"} onClose={onClose}>
      {step === "confirm" && (
        <div className="flex flex-col gap-6">
          <CloseButton onClose={onClose} />
          <h2 className="pr-10 text-xl font-semibold text-[#123A1E]">
            {confirmTitle}
          </h2>
          <p className="text-gray-800">{confirmMessage}</p>
          <div className="flex justify-end gap-3">
            <Button onClick={onClose} sx={cancelButtonSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              startIcon={<FileDownloadOutlinedIcon />}
              sx={primaryButtonSx}
            >
              Download
            </Button>
          </div>
        </div>
      )}

      {step === "preparing" && (
        <div
          className="flex flex-col items-center gap-6 py-4 text-center"
          role="status"
        >
          <CloseButton onClose={onClose} />
          <h2 className="text-2xl font-bold text-black">
            Preparing your export
          </h2>
          <CircularProgress size={96} thickness={2.5} sx={{ color: "#2D7A45" }} />
          <p className="max-w-xs text-gray-600">
            This may take a few minutes depending on the size of the data.
          </p>
        </div>
      )}

      {step === "ready" && (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E3F2E6]">
            <CheckIcon sx={{ fontSize: 56, color: "#123A1E" }} />
          </div>
          <h2 className="text-2xl font-bold text-black">Export ready</h2>
          <p className="text-gray-600">{successMessage}</p>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{ ...primaryButtonSx, minWidth: 172 }}
          >
            Close
          </Button>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col gap-6" role="alert">
          <CloseButton onClose={onClose} />
          <h2 className="pr-10 text-xl font-semibold text-[#123A1E]">
            Export failed
          </h2>
          <p className="text-gray-800">
            Something went wrong while preparing your export. Please try again.
          </p>
          <div className="flex justify-end gap-3">
            <Button onClick={onClose} sx={cancelButtonSx}>
              Close
            </Button>
            <Button variant="contained" onClick={onConfirm} sx={primaryButtonSx}>
              Try again
            </Button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
