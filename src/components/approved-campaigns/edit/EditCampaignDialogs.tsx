"use client";

import { useMemo } from "react";
import { Button } from "@mui/material";
import { EditCampaignFormData } from "@/src/types/frontend/campaignEdit";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";

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
  {
    label: "Campaign Photos",
    fields: ["imageRecords"],
  }
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
  showErrorToast: boolean;
  saveErrorMessage: string;
  onCloseSaveModal: () => void;
  onConfirmSave: () => void;
  onCloseCancelModal: () => void;
  onConfirmCancel: () => void;
  onCloseDiscardModal: () => void;
  onConfirmDiscard: () => void;
  onCloseToast: () => void;
  onCloseErrorToast: () => void;
}

export default function EditCampaignDialogs({
  initialData,
  formData,
  isSaveModalOpen,
  isCancelModalOpen,
  isDiscardModalOpen,
  showSuccessToast,
  showErrorToast,
  saveErrorMessage,
  onCloseSaveModal,
  onConfirmSave,
  onCloseCancelModal,
  onConfirmCancel,
  onCloseDiscardModal,
  onConfirmDiscard,
  onCloseToast,
  onCloseErrorToast,
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
      <BaseModal
        open={isSaveModalOpen}
        onClose={onCloseSaveModal}
        title="Confirm Edit"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pr-2">
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
            <p className="text-sm text-gray-500">
              Changes cannot be reversed unless edit is requested again. Are you
              sure you would like to save changes?
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
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
          </div>
        </div>
      </BaseModal>

      <BaseModal
        open={isCancelModalOpen}
        onClose={onCloseCancelModal}
        title="Unsaved changes"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 pt-2">
            <p className="m-0 text-[16px] leading-[1.5] text-[#5F6368]">
              You have unsaved changes. If you leave, your edits will be lost.
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-4">
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
          </div>
        </div>
      </BaseModal>

      <BaseModal
        open={isDiscardModalOpen}
        onClose={onCloseDiscardModal}
        title="Discard changes?"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 pt-2">
            <p className="m-0 text-[16px] leading-[1.5] text-[#5F6368]">
              You have unsaved changes. This will reset the form to its previous
              state.
            </p>
          </div>
          <div className="mt-8 flex justify-end gap-4">
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
      </BaseModal>

      <BaseAlert
        open={showSuccessToast}
        onClose={onCloseToast}
        title="Campaigns Updated!"
      >
        You have successfully updated this campaign.
      </BaseAlert>

      <BaseAlert
        open={showErrorToast}
        onClose={onCloseErrorToast}
        title="Save Failed"
      >
        {saveErrorMessage ||
          "An error occurred while saving. Please try again."}
      </BaseAlert>
    </>
  );
}
