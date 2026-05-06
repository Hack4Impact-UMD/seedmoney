"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import { useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/src/types/db/campaigns";
import type { HydratedCampaignImageRecord } from "@/src/types/db/campaignImageRecords";
import type { Existence } from "@/src/types/db/enums";
import Loading from "@/src/app/loading";
import AppError from "@/src/app/error";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useCreateFinalAnswer from "@/src/hooks/answers/useCreateFinalAnswer";
import CampaignInformationSection from "@/src/components/ongoing-campaigns/edit/CampaignInformationSection";
import CampaignMediaSection from "@/src/components/ongoing-campaigns/edit/CampaignMediaSection";
import ContactInformationSection from "@/src/components/ongoing-campaigns/edit/ContactInformationSection";
import EditCampaignActions from "@/src/components/ongoing-campaigns/edit/EditCampaignActions";
import EditCampaignDialogs from "@/src/components/ongoing-campaigns/edit/EditCampaignDialogs";
import EditCampaignHeader from "@/src/components/ongoing-campaigns/edit/EditCampaignHeader";
import GardenInformationSection from "@/src/components/ongoing-campaigns/edit/GardenInformationSection";
import GardenStorySection from "@/src/components/ongoing-campaigns/edit/GardenStorySection";
import {
  type EditCampaignFormData,
  type TextFieldKey,
  DEFAULT_CAMPAIGN_DATA,
} from "@/src/types/frontend/campaignEdit";
import {
  beneficiaryOptions,
  categoryOptions,
} from "@/src/components/ongoing-campaigns/options";
import { useCampaignEditData } from "@/src/hooks/campaigns/useCampaignEditData";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.["campaign-id"] as string;
  const parsedCampaignId = Number(campaignId);

  const queryClient = useQueryClient();
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

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const status = formData.status;

  const { data: currentCompetitionData } = useReadCurrentCompetition();
  const currentCompetitionId = currentCompetitionData?.competition_id;
  
  const isPreviousCampaign = 
    campaignEditData?.mappedData.competitionId != null &&
    currentCompetitionId != null &&
    campaignEditData.mappedData.competitionId !== currentCompetitionId;

  let tag;
  if (isPreviousCampaign) {
    if (status === "pending") {
      tag = { label: "Pending", color: "#6B21A8", borderColor: "#6B21A8" };
    } else if (status === "denied") {
      tag = { label: "Denied", color: "#DC2626", borderColor: "#DC2626" };
    } else if (status === "approved" || status === "published") {
      tag = { label: "Approved", color: "#16A34A", borderColor: "#16A34A" };
    }
  }

  useEffect(() => {
    if (!campaignEditData) return;

    if (initialData.campaignTitle === "") {
      setInitialData(campaignEditData.mappedData);
      setFormData(campaignEditData.mappedData);
    } else {
      // Subsequent updates — only sync imageRecords if not locally modified
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
    },
    [],
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

      queryClient.invalidateQueries({
        queryKey: ["campaigns"],
      });

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
    queryClient,
  ]);

  const navigateToCampaignPage = useCallback(() => {
    if (!parsedCampaignId) {
      router.push("/dashboard/approved-campaigns");
      return;
    }
    router.push(`/dashboard/approved-campaigns/${parsedCampaignId}`);
  }, [parsedCampaignId, router]);

  const handleAttemptLeave = useCallback(() => {
    if (isFormDirty) {
      setIsCancelModalOpen(true);
      return;
    }
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
  if (!campaignEditData) return <Loading />;

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 py-4 px-4 md:py-10 md:pl-10 md:pr-16 space-y-3">
        <EditCampaignHeader
          text={isPreviousCampaign ? formData.campaignTitle : `Edit Campaign - ${formData.campaignTitle}`}
          onBack={handleAttemptLeave}
          tag={tag}
        />

        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-24">
          <div className="flex-1 flex flex-col gap-6 w-full max-w-full">
            {!isPreviousCampaign && (
              <div className="md:hidden mt-2">
                <EditCampaignActions
                  isFormDirty={isFormDirty}
                  onSave={() => setIsSaveModalOpen(true)}
                  onCancel={handleAttemptDiscard}
                />
                <div className="text-sm text-gray-500 mt-4 flex items-center">
                  <span className="text-orange-500 text-lg mr-1">*</span> = required field
                </div>
              </div>
            )}

            <div className={isPreviousCampaign ? "pointer-events-none flex flex-col gap-6 w-full max-w-full" : "flex flex-col gap-6 w-full max-w-full"}>
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
          </div>

          {!isPreviousCampaign && (
            <div className="hidden md:block sticky top-10">
              <EditCampaignActions
                isFormDirty={isFormDirty}
                onSave={() => setIsSaveModalOpen(true)}
                onCancel={handleAttemptDiscard}
              />
            </div>
          )}
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
