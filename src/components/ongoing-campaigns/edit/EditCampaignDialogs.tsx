"use client";

import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
} from "@mui/material";
import { CheckCircleOutline, Close } from "@mui/icons-material";
import { EditCampaignFormData } from "./types";

interface EditCampaignDialogsProps {
  formData: EditCampaignFormData;
  isSaveModalOpen: boolean;
  isCancelModalOpen: boolean;
  showSuccessToast: boolean;
  onCloseSaveModal: () => void;
  onConfirmSave: () => void;
  onCloseCancelModal: () => void;
  onConfirmCancel: () => void;
  onCloseToast: () => void;
}

export default function EditCampaignDialogs({
  formData,
  isSaveModalOpen,
  isCancelModalOpen,
  showSuccessToast,
  onCloseSaveModal,
  onConfirmSave,
  onCloseCancelModal,
  onConfirmCancel,
  onCloseToast,
}: EditCampaignDialogsProps) {
  return (
    <>
      <Dialog open={isSaveModalOpen} onClose={onCloseSaveModal} fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-[#1A4A28] font-bold text-xl">Confirm Edit</span>
          <IconButton
            aria-label="close"
            onClick={onCloseSaveModal}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="mb-4 text-gray-600">
            You are about to edit this campaign:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-6 text-black font-medium">
            <li>Campaign title</li>
            <li>
              Garden story -{" "}
              <strong>Where is your garden, and who does it serve?</strong>
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Changes cannot be reversed unless edit is requested again. Are you
            sure you would like to save changes?
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onCloseSaveModal}
            sx={{ color: "gray", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log("Saving data:", formData);
              onConfirmSave();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCancelModalOpen}
        onClose={onCloseCancelModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-[#1A4A28] font-bold text-xl">Confirm Edit</span>
          <IconButton
            aria-label="close"
            onClick={onCloseCancelModal}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="mb-4 text-gray-600">
            Are you sure you want to leave this form? Your changes will not be
            saved.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseCancelModal}>Cancel</Button>
          <Button variant="contained" onClick={onConfirmCancel}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccessToast}
        autoHideDuration={4000}
        onClose={onCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 1, mr: 1 }}
      >
        <Alert
          icon={
            <CheckCircleOutline fontSize="small" sx={{ color: "#1A4A28" }} />
          }
          severity="success"
        >
          <AlertTitle sx={{ fontSize: "16px" }}>Campaigns Updated!</AlertTitle>
          <span className="text-[14px]">
            You have successfully updated 2 <br />
            campaigns.
          </span>
        </Alert>
      </Snackbar>
    </>
  );
}
