"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import type { Campaign } from "@/src/types/db/campaigns";
import CampaignInformationSection from "@/src/components/ongoing-campaigns/edit/CampaignInformationSection";
import CampaignMediaSection from "@/src/components/ongoing-campaigns/edit/CampaignMediaSection";
import ContactInformationSection from "@/src/components/ongoing-campaigns/edit/ContactInformationSection";
import EditCampaignActions from "@/src/components/ongoing-campaigns/edit/EditCampaignActions";
import EditCampaignDialogs from "@/src/components/ongoing-campaigns/edit/EditCampaignDialogs";
import EditCampaignHeader from "@/src/components/ongoing-campaigns/edit/EditCampaignHeader";
import GardenInformationSection from "@/src/components/ongoing-campaigns/edit/GardenInformationSection";
import GardenStorySection from "@/src/components/ongoing-campaigns/edit/GardenStorySection";
import type {
  EditCampaignFormData,
  TextFieldKey,
} from "@/src/components/ongoing-campaigns/edit/types";
import {
  beneficiaryOptions,
  categoryOptions,
  COUNTRIES,
  MOCK_CAMPAIGN_DATA,
  US_STATES,
} from "./options";

function parseCampaignIdParam(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const rawCampaignId = params["campaign-id"];
  const campaignId = Array.isArray(rawCampaignId)
    ? rawCampaignId[0]
    : rawCampaignId ?? "";
  const parsedCampaignId = parseCampaignIdParam(campaignId);

  const [initialData, setInitialData] = useState(MOCK_CAMPAIGN_DATA);
  const [formData, setFormData] = useState(MOCK_CAMPAIGN_DATA);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    if (parsedCampaignId === null) {
      router.replace("/dashboard/ongoing-campaigns");
    }
  }, [parsedCampaignId, router]);

  const setFieldValue = useCallback(
    <K extends keyof EditCampaignFormData>(
      field: K,
      value: EditCampaignFormData[K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleTextChange = useCallback(
    (field: TextFieldKey) =>
      (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
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

      return {
        ...prev,
        gardenBeneficiaries: next,
      };
    });
  }, []);

  const handleConfirmSave = useCallback(() => {
    setInitialData(formData);
    setIsSaveModalOpen(false);
    setShowSuccessToast(true);
  }, [formData]);

  const navigateToCampaignPage = useCallback(() => {
    if (parsedCampaignId === null) {
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
    if (!isFormDirty) {
      return;
    }

    setIsDiscardModalOpen(true);
  }, [isFormDirty]);

  const handleConfirmDiscard = useCallback(() => {
    setFormData(initialData);
    setIsDiscardModalOpen(false);
  }, [initialData]);

  if (parsedCampaignId === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[
          {
            campaign_id: parsedCampaignId,
            name: formData.campaignTitle,
            status: "published",
            date_created: new Date().toISOString(),
            
          } as Campaign,
        ]}
        selectedCampaignId={parsedCampaignId}
        onCampaignSelect={() => {}}
      />

      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 py-10 pl-10 pr-32 space-y-3">
        <EditCampaignHeader
          campaignId={String(parsedCampaignId)}
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
              usStates={US_STATES}
              countries={COUNTRIES}
              beneficiaryOptions={beneficiaryOptions}
              onTextChange={handleTextChange}
              setFieldValue={setFieldValue}
              onToggleBeneficiary={handleToggleBeneficiary}
            />

            <GardenStorySection
              formData={formData}
              onTextChange={handleTextChange}
            />

            <CampaignMediaSection />

            <ContactInformationSection
              formData={formData}
              usStates={US_STATES}
              countries={COUNTRIES}
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
        onCloseSaveModal={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSave}
        onCloseCancelModal={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
        onCloseDiscardModal={() => setIsDiscardModalOpen(false)}
        onConfirmDiscard={handleConfirmDiscard}
        onCloseToast={() => setShowSuccessToast(false)}
      />
    </div>
  );
}
