"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import Loading from "@/src/app/loading";
import AppError from "@/src/app/error";
import CampaignInformationSection from "@/src/components/approved-campaigns/edit/CampaignInformationSection";
import CampaignMediaSection from "@/src/components/approved-campaigns/edit/CampaignMediaSection";
import ContactInformationSection from "@/src/components/approved-campaigns/edit/ContactInformationSection";
import EditCampaignHeader from "@/src/components/approved-campaigns/edit/EditCampaignHeader";
import GardenInformationSection from "@/src/components/approved-campaigns/edit/GardenInformationSection";
import GardenStorySection from "@/src/components/approved-campaigns/edit/GardenStorySection";
import {
  beneficiaryOptions,
  categoryOptions,
} from "@/src/components/approved-campaigns/options";
import { useCampaignEditData } from "@/src/hooks/campaigns/useCampaignEditData";
import type {
  SetFieldValue,
  TextChangeHandler,
} from "@/src/types/frontend/campaignEdit";

const noopTextChange: TextChangeHandler = () => () => undefined;
const noopSetFieldValue: SetFieldValue = () => undefined;

export default function ViewPendingApplicationPage() {
  const router = useRouter();
  const { campaignId } = useParams<{ campaignId: string }>();
  const parsedCampaignId = Number(campaignId);

  const {
    data: campaignEditData,
    isLoading,
    error,
    refetch,
  } = useCampaignEditData(parsedCampaignId);

  if (!parsedCampaignId) notFound();
  if (isLoading) return <Loading />;
  if (error) return <AppError error={error as Error} reset={() => refetch()} />;
  if (!campaignEditData) notFound();
  if (campaignEditData.mappedData.status !== "pending") notFound();

  const formData = campaignEditData.mappedData;

  return (
    <div className="flex w-full flex-col gap-6">
      <EditCampaignHeader
        text={`View Pending Application - ${formData.campaignTitle}`}
        onBack={() => router.push(`/dashboard/${parsedCampaignId}`)}
        tag={{ label: "Pending", color: "#6B21A8", borderColor: "#6B21A8" }}
      />

      <div className="pointer-events-none flex w-full max-w-full flex-col gap-6">
        <CampaignInformationSection
          formData={formData}
          onTextChange={noopTextChange}
          setFieldValue={noopSetFieldValue}
        />

        <GardenInformationSection
          formData={formData}
          categoryOptions={categoryOptions}
          beneficiaryOptions={beneficiaryOptions}
          onTextChange={noopTextChange}
          setFieldValue={noopSetFieldValue}
          onToggleBeneficiary={() => undefined}
        />

        <GardenStorySection
          formData={formData}
          onTextChange={noopTextChange}
          questions={campaignEditData.storyQuestions}
        />

        <CampaignMediaSection
          formData={formData}
          campaignId={parsedCampaignId}
          syncImageRecords={() => undefined}
          readOnly
        />

        <ContactInformationSection
          formData={formData}
          onTextChange={noopTextChange}
          setFieldValue={noopSetFieldValue}
        />
      </div>
    </div>
  );
}
