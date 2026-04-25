"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import type { Campaign } from "@/src/types/db/campaigns";
import type { HydratedCampaignImageRecord } from "@/src/types/db/campaignImageRecords";
import type { Existence, Status } from "@/src/types/db/enums";
import Loading from "@/src/app/loading";
import AppError from "@/src/app/error";
import NotFound from "@/src/app/not-found";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useCreateFinalAnswer from "@/src/hooks/answers/useCreateFinalAnswer";
import { Button } from "@mui/material";
import CampaignInformationSection from "@/src/components/ongoing-campaigns/edit/CampaignInformationSection";
import CampaignMediaSection from "@/src/components/ongoing-campaigns/edit/CampaignMediaSection";
import ContactInformationSection from "@/src/components/ongoing-campaigns/edit/ContactInformationSection";
import EditCampaignActions from "@/src/components/ongoing-campaigns/edit/EditCampaignActions";
import EditCampaignDialogs from "@/src/components/ongoing-campaigns/edit/EditCampaignDialogs";
import EditCampaignHeader from "@/src/components/ongoing-campaigns/edit/EditCampaignHeader";
import GardenInformationSection from "@/src/components/ongoing-campaigns/edit/GardenInformationSection";
import GardenStorySection from "@/src/components/ongoing-campaigns/edit/GardenStorySection";
import {
  DEFAULT_CAMPAIGN_DATA,
  EditCampaignFormData,
  TextFieldKey,
} from "@/src/types/frontend/campaignEdit";
import {
  beneficiaryOptions,
  categoryOptions,
} from "@/src/components/ongoing-campaigns/options";
import { useCampaignEditData } from "@/src/hooks/campaigns/useCampaignEditData";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";

export default function CampaignReviewPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.["campaignId"] as string;
  const parsedCampaignId = Number(campaignId);

  const updateCampaignMutation = useUpdateCampaign();
  const createFinalAnswerMutation = useCreateFinalAnswer();
  const { data: campaignEditData, isLoading, error, refetch } = useCampaignEditData(parsedCampaignId);

  const [initialData, setInitialData] = useState<EditCampaignFormData>(DEFAULT_CAMPAIGN_DATA);
  const [formData, setFormData] = useState<EditCampaignFormData>(DEFAULT_CAMPAIGN_DATA);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  const [isApprovedModalOpen, setIsApprovedModalOpen] = useState(false);
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const [isRestoredModalOpen, setIsRestoredModalOpen] = useState(false);

  const [isSaveAlertOpen, setIsSaveAlertOpen] = useState(false);

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const status = formData.status;

  useEffect(() => {
    if (!campaignEditData) return;

    if (initialData.campaignTitle === "") {
      setInitialData(campaignEditData.mappedData);
      setFormData(campaignEditData.mappedData);
    } else {
      const localChanged =
        JSON.stringify(formData.imageRecords) !==
        JSON.stringify(initialData.imageRecords);
      if (!localChanged) {
        setFormData((prev) => ({
          ...prev,
          imageRecords: campaignEditData.mappedData.imageRecords,
        }));
        setInitialData((prev) => ({
          ...prev,
          imageRecords: campaignEditData.mappedData.imageRecords,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignEditData]);

  const setFieldValue = useCallback(
    <K extends keyof EditCampaignFormData,>(field: K, value: EditCampaignFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, [],
  );

  const handleTextChange = useCallback(
    (field: TextFieldKey) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFieldValue(field, e.target.value);
      },
    [setFieldValue],
  );

  const syncImageRecords = useCallback(
    (
      imageRecords: HydratedCampaignImageRecord[],
      options?: { syncInitialData?: boolean },
    ) => {
      setFormData((prev) => ({ ...prev, imageRecords }));
      if (options?.syncInitialData !== false) {
        setInitialData((prev) => ({ ...prev, imageRecords }));
      }
    },
    [],
  );

  const handleToggleBeneficiary = useCallback((option: string) => {
    setFormData((prev) => {
      const current = prev.gardenBeneficiaries;
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, gardenBeneficiaries: next };
    });
  }, []);

  const handleStatusUpdate = useCallback(async (newStatus: Status) => {
    if (isFormDirty) {
      setIsSaveAlertOpen(true);
      return;
    }
    await updateCampaignMutation.mutateAsync({
      campaignId: parsedCampaignId,
      campaignData: { status: newStatus },
    });
    setFieldValue("status", newStatus);
    const action =
      newStatus === "approved"
        ? "approved"
        : newStatus === "denied"
          ? "denied"
          : newStatus === "pending"
            ? "reverted"
            : null;
    const nextPath = action
      ? `/dashboard/review-applications?action=${action}&campaign=${encodeURIComponent(formData.campaignTitle)}`
      : "/dashboard/review-applications";
    router.push(nextPath);
  }, [
    formData.campaignTitle,
    isFormDirty,
    parsedCampaignId,
    updateCampaignMutation,
    setFieldValue,
    router,
  ]);

  const handleConfirmSave = useCallback(async () => {
    if (!parsedCampaignId) return;

    try {
      const campaignPayload: Partial<Campaign> = {
        name: formData.campaignTitle,
        impact: Number(formData.beneficiaryCount) || 0,
        size: formData.gardenSize,
        existence: (formData.gardenStatus || "existing") as Existence,
        goal: Number(formData.fundraisingGoal) || 0,
        city: formData.gardenCity,
        state: formData.gardenState,
        country: formData.gardenCountry,
        project_category: formData.gardenCategory,
        project_beneficiaries: formData.gardenBeneficiaries,
        organization_name: formData.organizationName,
        ein: formData.organizationIdentifier,
        mailing_street_1: formData.mailingStreet1,
        mailing_street_2: formData.mailingStreet2,
        mailing_city: formData.mailingCity,
        mailing_state: formData.mailingState,
        mailing_country: formData.mailingCountry,
        mailing_zipcode: formData.mailingZip,
        contact_first_name: formData.contactFirstName,
        contact_last_name: formData.contactLastName,
        contact_email: formData.contactEmail,
        contact_role: formData.contactRole,
      };

      const finalAnswerCandidates = [
        {
          questionNumber: 1,
          questionId: formData.storyLocationAndAudienceQuestionId,
          before: initialData.storyLocationAndAudienceFinal,
          after: formData.storyLocationAndAudienceFinal,
        },
        {
          questionNumber: 2,
          questionId: formData.storyChallengeQuestionId,
          before: initialData.storyChallengeFinal,
          after: formData.storyChallengeFinal,
        },
        {
          questionNumber: 3,
          questionId: formData.storySeasonActivityQuestionId,
          before: initialData.storySeasonActivityFinal,
          after: formData.storySeasonActivityFinal,
        },
        {
          questionNumber: 4,
          questionId: formData.storyCampaignImpactQuestionId,
          before: initialData.storyCampaignImpactFinal,
          after: formData.storyCampaignImpactFinal,
        },
      ];

      const changedFinalAnswerCandidates = finalAnswerCandidates.filter(
        (update) => update.before !== update.after,
      );

      const missingQuestionNumbers = changedFinalAnswerCandidates
        .filter((update) => update.questionId === null)
        .map((update) => update.questionNumber);

      if (missingQuestionNumbers.length > 0) {
        const message = `Missing final answer question IDs for campaign ${parsedCampaignId}: ${missingQuestionNumbers.join(", ")}`;
        console.error(message);
        setSaveErrorMessage(message);
        setIsSaveModalOpen(false);
        setShowErrorToast(true);
        return;
      }

      const finalAnswerUpdates = changedFinalAnswerCandidates.filter(
        (update): update is { questionNumber: number; questionId: number; before: string; after: string } =>
          update.questionId !== null,
      );

      await updateCampaignMutation.mutateAsync({
        campaignId: parsedCampaignId,
        campaignData: campaignPayload,
      });

      await Promise.all(
        finalAnswerUpdates.map(({ questionId, after }) =>
          createFinalAnswerMutation.mutateAsync({
            campaignId: parsedCampaignId,
            questionId,
            finalAnswer: after,
          }),
        ),
      );

      setInitialData(formData);
      setIsSaveModalOpen(false);
      setShowSuccessToast(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Save error:", message);
      setSaveErrorMessage(message);
      setIsSaveModalOpen(false);
      setShowErrorToast(true);
    }
  }, [
    createFinalAnswerMutation,
    formData,
    initialData,
    parsedCampaignId,
    updateCampaignMutation,
  ]);

  const navigateToCampaignPage = useCallback(() => {
    if (!parsedCampaignId) {
      router.push("/dashboard/ongoing-campaigns");
      return;
    }
    router.push(`/dashboard/review-applications`);
  }, [parsedCampaignId, router]);

  const handleAttemptLeave = useCallback(() => {
    if (isFormDirty) { setIsCancelModalOpen(true); return; }
    navigateToCampaignPage();
  }, [isFormDirty, navigateToCampaignPage]);

  const handleConfirmCancel = useCallback(() => {
    setIsCancelModalOpen(false);
    navigateToCampaignPage();
  }, [navigateToCampaignPage]);

  const handleAttemptDiscard = useCallback(() => {
    if (!isFormDirty) return;
    setIsDiscardModalOpen(true);
  }, [isFormDirty]);

  const handleConfirmDiscard = useCallback(() => {
    setFormData(initialData);
    setIsDiscardModalOpen(false);
  }, [initialData]);

  if (!parsedCampaignId) return null;
  if (isLoading) return <Loading />;
  if (error) return <AppError error={error as Error} reset={() => refetch()} />;
  if (!campaignEditData) return <NotFound />;
  if (
    campaignEditData.mappedData.status !== "pending" &&
    campaignEditData.mappedData.status !== "denied"
  ) {
    return <NotFound />;
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <BaseModal
        open={!!isApprovedModalOpen}
        onClose={() => setIsApprovedModalOpen(false)}
        title="Confirm Approval"
      >
        <div className="px-4 pb-4 text-[16px] text-[#727873]">
          <p>You are about to approve:</p>
          <ul className="mt-2 mb-2 list-disc pl-6 text-[#222622]">
            <li>
              {campaignEditData.mappedData.campaignTitle}
            </li>
          </ul>
          <p>Are you sure you would like to approve?</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-4 pb-4">
          <Button
            onClick={() => setIsApprovedModalOpen(false)}
            variant="text"
          >
            CANCEL
          </Button>
          <Button
            onClick= {() => handleStatusUpdate("approved")}
            variant="contained"
            color="success"
          >
            APPROVE
          </Button>
        </div>

      </BaseModal>

      <BaseModal
        open={!!isDeniedModalOpen}
        onClose={() => setIsDeniedModalOpen(false)}
        title="Confirm Denial"
      >
        <div className="px-4 pb-4 text-[16px] text-[#727873]">
          <p>You are about to deny:</p>
          <ul className="mt-2 mb-2 list-disc pl-6 text-[#222622]">
            <li>
              {campaignEditData.mappedData.campaignTitle}
            </li>
          </ul>
          <p>Are you sure you would like to deny? You can view denied campaigns using the “DENIED” tab. </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-4 pb-4">
          <Button
            onClick={() => setIsDeniedModalOpen(false)}
            variant="text"
          >
            CANCEL
          </Button>
          <Button
            onClick= {() => handleStatusUpdate("denied")}
            variant="contained"
            color="success"
          >
            DENY
          </Button>
        </div>
      </BaseModal>

      <BaseModal
        open={!!isRestoredModalOpen}
        onClose={() => setIsRestoredModalOpen(false)}
        title="Confirm Restore"
      >
        <div className="px-4 pb-4 text-[16px] text-[#727873]">
          <p>You are about to restore:</p>
          <ul className="mt-2 mb-2 list-disc pl-6 text-[#222622]">
            <li>
              {campaignEditData.mappedData.campaignTitle}
            </li>
          </ul>
          <p>Are you sure you would like to restore? You can view restored campaigns using the “PENDING” tab.</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-4 pb-4">
          <Button
            onClick={() => setIsRestoredModalOpen(false)}
            variant="text"
          >
            CANCEL
          </Button>
          <Button
            onClick= {() => handleStatusUpdate("pending")}
            variant="contained"
          >
            RESTORE
          </Button>
        </div>
      </BaseModal>

      <BaseAlert
        open={!!isSaveAlertOpen}
        onClose={() => setIsSaveAlertOpen(false)}
        title="Reminder to save changes!"
      >
        Make sure to save your changes before making status changes!
      </BaseAlert>

      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 py-10 pl-10 pr-32 space-y-3">
        <EditCampaignHeader
          text={`Review Application - ${formData.campaignTitle}`}
          onBack={handleAttemptLeave}
        />

        <div className="flex items-start gap-24">
          <div className="flex-1 flex flex-col gap-6">
            <CampaignInformationSection
              formData={formData}
              onTextChange={handleTextChange}
              setFieldValue={setFieldValue}
            />

            <GardenInformationSection
              formData={formData}
              categoryOptions={categoryOptions}
              beneficiaryOptions={beneficiaryOptions}
              onTextChange={handleTextChange}
              setFieldValue={setFieldValue}
              onToggleBeneficiary={handleToggleBeneficiary}
            />

            <GardenStorySection
              formData={formData}
              onTextChange={handleTextChange}
              questions={campaignEditData.storyQuestions}
            />

            <CampaignMediaSection
              formData={formData}
              campaignId={parsedCampaignId}
              syncImageRecords={syncImageRecords}
            />

            <ContactInformationSection
              formData={formData}
              onTextChange={handleTextChange}
              setFieldValue={setFieldValue}
            />
          </div>

          <div className="flex flex-col gap-2 sticky top-10">
            {status === "pending" && (
              <>
                <Button
                  variant="contained"
                  disabled={updateCampaignMutation.isPending}
                  onClick={() => setIsApprovedModalOpen(true)}
                >
                  APPROVE
                </Button>
                <Button
                  variant="outlined"
                  disabled={updateCampaignMutation.isPending}
                  onClick={() => setIsDeniedModalOpen(true)}
                >
                  DENY
                </Button>
              </>
            )}

            {status === "denied" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  disabled={updateCampaignMutation.isPending}
                  onClick={() => setIsApprovedModalOpen(true)}
                >
                  APPROVE
                </Button>
                <Button
                  variant="outlined"
                  disabled={updateCampaignMutation.isPending}
                  onClick={() => setIsRestoredModalOpen(true)}
                >
                  RESTORE
                </Button>
              </>
            )}

            <EditCampaignActions
              isFormDirty={isFormDirty}
              onSave={() => setIsSaveModalOpen(true)}
              onCancel={handleAttemptDiscard}
            />
          </div>
        </div>

        <div className="h-20" />
      </div>

      <EditCampaignDialogs
        initialData={initialData}
        formData={formData}
        isSaveModalOpen={isSaveModalOpen}
        isCancelModalOpen={isCancelModalOpen}
        isDiscardModalOpen={isDiscardModalOpen}
        showSuccessToast={showSuccessToast}
        showErrorToast={showErrorToast}
        saveErrorMessage={saveErrorMessage}
        onCloseSaveModal={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSave}
        onCloseCancelModal={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
        onCloseDiscardModal={() => setIsDiscardModalOpen(false)}
        onConfirmDiscard={handleConfirmDiscard}
        onCloseToast={() => setShowSuccessToast(false)}
        onCloseErrorToast={() => setShowErrorToast(false)}
      />
    </div>
  );
}
