"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import { useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/src/types/db/campaigns";
import type { Existence } from "@/src/types/db/enums";
import Loading from "@/src/app/loading";
import AppError from "@/src/app/error";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import { useSetMainCampaignImage } from "@/src/hooks/campaign-image-records/useSetMainPhoto";
import { AnswerWithQuestion, updateAnswer } from "@/src/actions/db/answers";
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

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.["campaign-id"] as string;
  const parsedCampaignId = Number(campaignId);

  const queryClient = useQueryClient();
  const updateCampaignMutation = useUpdateCampaign();

  const { data: campaignEditData, isLoading, error, refetch } = useCampaignEditData(parsedCampaignId);
  const setMainImageMutation = useSetMainCampaignImage(parsedCampaignId);


  const [initialData, setInitialData] = useState<EditCampaignFormData>(DEFAULT_CAMPAIGN_DATA);
  const [formData, setFormData] = useState<EditCampaignFormData>(DEFAULT_CAMPAIGN_DATA);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    if (!campaignEditData) return;

    if (initialData.campaignTitle === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        size: Number(formData.gardenSize) || 0,
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

      await updateCampaignMutation.mutateAsync({
        campaignId: parsedCampaignId,
        campaignData: campaignPayload,
      });

      // Save answer changes
      const answersData = campaignEditData?.answersData;
      if (answersData) {
        const buildAnswerUpdate = (qNum: number, finalValue: string) => {
          const ans = answersData.find((a: AnswerWithQuestion) => a.questions?.question_number === qNum);
          if (ans?.answer_id) return updateAnswer(ans.answer_id, { final_answer: finalValue });
          return Promise.resolve(null);
        };

        await Promise.all([
          buildAnswerUpdate(1, formData.storyLocationAndAudienceFinal),
          buildAnswerUpdate(2, formData.storyChallengeFinal),
          buildAnswerUpdate(3, formData.storySeasonActivityFinal),
          buildAnswerUpdate(4, formData.storyCampaignImpactFinal),
        ]);
      }

      const imageChanged =
        JSON.stringify(formData.imageRecords) !==
        JSON.stringify(initialData.imageRecords);
      if (imageChanged) {
        const mainImage = formData.imageRecords.find((r) => r.is_main);
        if (mainImage) {
          await setMainImageMutation.mutateAsync(mainImage.id);
        }
      }

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
  }, [formData, initialData, parsedCampaignId, campaignEditData, updateCampaignMutation, queryClient, setMainImageMutation ]);

  const navigateToCampaignPage = useCallback(() => {
    if (!parsedCampaignId) {
      router.push("/dashboard/ongoing-campaigns");
      return;
    }
    router.push(`/dashboard/ongoing-campaigns/${parsedCampaignId}`);
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

      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 py-10 pl-10 pr-32 space-y-3">
        <EditCampaignHeader
          text = {`Edit Campaign -${formData.campaignTitle}`}
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
              setFieldValue={setFieldValue}
            />

            <ContactInformationSection
              formData={formData}
              onTextChange={handleTextChange}
              setFieldValue={setFieldValue}
            />
          </div>

          <EditCampaignActions
            isFormDirty={isFormDirty}
            onSave={() => setIsSaveModalOpen(true)}
            onCancel={handleAttemptDiscard}
          />
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