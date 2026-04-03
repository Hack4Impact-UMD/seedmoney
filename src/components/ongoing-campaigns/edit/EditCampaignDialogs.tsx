"use client";

import { useMemo } from "react";
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

const SECTION_CHANGE_GROUPS: Array<{
  label: string;
  fields: Array<keyof EditCampaignFormData>;
}> = [
  {
    label: "Campaign Title",
    fields: ["campaignTitle"],
  },
  {
    label: "Project Details & Impact",
    fields: ["beneficiaryCount", "gardenStatus", "gardenSize"],
  },
  {
    label: "Fundraising Goal",
    fields: ["fundraisingGoal"],
  },
  {
    label: "Garden Location",
    fields: ["gardenCity", "gardenState", "gardenCountry"],
  },
  {
    label: "Primary Project Category",
    fields: ["gardenCategory"],
  },
  {
    label: "Beneficiary Populations Served",
    fields: ["gardenBeneficiaries"],
  },
  {
    label: "Organization Information",
    fields: ["organizationName", "organizationIdentifier"],
  },
  {
    label: "Beneficiary Organization Mailing Address",
    fields: [
      "mailingStreet1",
      "mailingStreet2",
      "mailingCity",
      "mailingState",
      "mailingZip",
      "mailingCountry",
    ],
  },
  {
    label: "Primary Contact Information",
    fields: [
      "contactFirstName",
      "contactLastName",
      "contactEmail",
      "contactRole",
    ],
  },
];

const STORY_QUESTION_CHANGES: Array<{
  field: keyof EditCampaignFormData;
  label: string;
}> = [
  {
    field: "storyLocationAndAudienceFinal",
    label: "Where is your garden, and who does it serve?",
  },
  {
    field: "storyChallengeFinal",
    label:
      "What challenge does your garden help address, and why does it matter locally?",
  },
  {
    field: "storySeasonActivityFinal",
    label: "What happens in the garden during the growing season?",
  },
  {
    field: "storyCampaignImpactFinal",
    label: "What will this year’s SeedMoney campaign make possible?",
  },
];

function hasChanged(
  before: EditCampaignFormData[keyof EditCampaignFormData],
  after: EditCampaignFormData[keyof EditCampaignFormData],
) {
  if (Array.isArray(before) && Array.isArray(after)) {
    return JSON.stringify(before) !== JSON.stringify(after);
  }

  return before !== after;
}

interface EditCampaignDialogsProps {
  initialData: EditCampaignFormData;
  formData: EditCampaignFormData;
  isSaveModalOpen: boolean;
  isCancelModalOpen: boolean;
  isDiscardModalOpen: boolean;
  showSuccessToast: boolean;
  onCloseSaveModal: () => void;
  onConfirmSave: () => void;
  onCloseCancelModal: () => void;
  onConfirmCancel: () => void;
  onCloseDiscardModal: () => void;
  onConfirmDiscard: () => void;
  onCloseToast: () => void;
}

export default function EditCampaignDialogs({
  initialData,
  formData,
  isSaveModalOpen,
  isCancelModalOpen,
  isDiscardModalOpen,
  showSuccessToast,
  onCloseSaveModal,
  onConfirmSave,
  onCloseCancelModal,
  onConfirmCancel,
  onCloseDiscardModal,
  onConfirmDiscard,
  onCloseToast,
}: EditCampaignDialogsProps) {
  const changedSections = useMemo(
    () => [
      ...SECTION_CHANGE_GROUPS.filter(({ fields }) =>
        fields.some((field) => hasChanged(initialData[field], formData[field])),
      ).map(({ label }) => label),
      ...STORY_QUESTION_CHANGES.filter(({ field }) =>
        hasChanged(initialData[field], formData[field]),
      ).map(({ label }) => label),
    ],
    [formData, initialData],
  );

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
        <DialogContent sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          <p className="mb-4 text-gray-600">
            You are about to edit this campaign:
          </p>
          {changedSections.length > 0 ? (
            <ul className="mb-4 list-disc space-y-1 pl-6 text-black font-medium">
              {changedSections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-gray-500">
              No editable fields were changed.
            </p>
          )}
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
        PaperProps={{
          sx: {
            borderRadius: "10px",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 4,
            pt: 4,
            pb: 0.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-[#1A4A28] text-[22px] font-bold leading-none">
            Unsaved changes
          </span>
          <IconButton
            aria-label="close"
            onClick={onCloseCancelModal}
            sx={{
              color: "#9E9E9E",
              mr: -1,
              mt: -0.5,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            px: 4,
            pt: 4.5,
            pb: 7,
          }}
        >
          <p className="m-0 max-w-[660px] text-[16px] leading-[1.5] text-[#5F6368]">
            You have unsaved changes. If you leave, your edits will be lost.
          </p>
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            pb: 4,
            pt: 0,
            gap: 2,
          }}
        >
          <Button
            onClick={onConfirmCancel}
            sx={{
              color: "#666666",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.02em",
            }}
          >
            Leave without saving
          </Button>
          <Button
            variant="contained"
            onClick={onCloseCancelModal}
            sx={{
              px: 3,
              py: 1.25,
              minWidth: "84px",
            }}
          >
            Stay
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDiscardModalOpen}
        onClose={onCloseDiscardModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
          },
        }}
      >
        <div className="relative px-8 pb-6 pt-8">
          <IconButton
            aria-label="close"
            onClick={onCloseDiscardModal}
            sx={{
              position: "absolute",
              top: 18,
              right: 18,
              color: "#9E9E9E",
            }}
          >
            <Close />
          </IconButton>
          <span className="block pr-12 text-[22px] font-bold leading-none text-[#1A4A28]">
            Discard changes?
          </span>
          <p className="m-0 mt-[38px] max-w-[660px] text-[16px] leading-[1.5] text-[#5F6368]">
            You have unsaved changes. This will reset the form to its previous
            state.
          </p>
          <div className="mt-[38px] flex justify-end gap-4">
          <Button
            onClick={onConfirmDiscard}
            sx={{
              color: "#666666",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.02em",
            }}
          >
            Discard changes
          </Button>
          <Button
            variant="contained"
            onClick={onCloseDiscardModal}
            sx={{
              px: 2.5,
              py: 1.1,
              minWidth: "128px",
            }}
          >
            Keep editing
          </Button>
          </div>
        </div>
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
            You have successfully updated this <br />
            campaigns.
          </span>
        </Alert>
      </Snackbar>
    </>
  );
}
