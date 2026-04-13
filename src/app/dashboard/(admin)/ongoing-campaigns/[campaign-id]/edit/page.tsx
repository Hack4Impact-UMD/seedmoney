"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import { useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/src/types/db/campaigns";
import type { Existence } from "@/src/types/db/enums";
import Loading from "@/src/app/loading";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useReadGardenStoryAnswers from "@/src/hooks/answers/useReadGardenStoryAnswers";
import { updateAnswer } from "@/src/actions/db/answers";
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
  US_STATES,
} from "./options";

const DEFAULT_CAMPAIGN_DATA: EditCampaignFormData = {
  campaignTitle: "",
  beneficiaryCount: "",
  gardenSize: "",
  gardenStatus: "existing",
  fundraisingGoal: "",
  gardenCity: "",
  gardenState: "",
  gardenCountry: "",
  gardenCategory: "",
  gardenBeneficiaries: [],
  organizationName: "",
  organizationIdentifier: "",
  mailingStreet1: "",
  mailingStreet2: "",
  mailingCity: "",
  mailingState: "",
  mailingZip: "",
  mailingCountry: "",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactRole: "",
  storyLocationAndAudience: "",
  storyLocationAndAudienceAI: "",
  storyLocationAndAudienceFinal: "",
  storyChallengeOriginal: "",
  storyChallengeAI: "",
  storyChallengeFinal: "",
  storySeasonActivityOriginal: "",
  storySeasonActivityAI: "",
  storySeasonActivityFinal: "",
  storyCampaignImpactOriginal: "",
  storyCampaignImpactAI: "",
  storyCampaignImpactFinal: "",
};

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
    : (rawCampaignId ?? "");
  const parsedCampaignId = parseCampaignIdParam(campaignId);
  const queryClient = useQueryClient();
  const updateCampaignMutation = useUpdateCampaign();

  const [initialData, setInitialData] = useState<EditCampaignFormData>(
    DEFAULT_CAMPAIGN_DATA,
  );
  const [formData, setFormData] = useState<EditCampaignFormData>(
    DEFAULT_CAMPAIGN_DATA,
  );
  const [storyQuestions, setStoryQuestions] = useState({
    q1: "Where is your garden, and who does it serve?",
    q2: "What challenge does your garden help address, and why does it matter locally?",
    q3: "What happens in the garden during the growing season?",
    q4: "What will this year’s SeedMoney campaign make possible?",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const { data: campaignData, isLoading: isLoadingCampaign } = useReadCampaign(
    parsedCampaignId ?? 0,
  );

  const { data: answersData, isLoading: isLoadingAnswers } =
    useReadGardenStoryAnswers(parsedCampaignId ?? 0);

  useEffect(() => {
    if (parsedCampaignId === null) {
      router.replace("/dashboard/ongoing-campaigns");
    }
  }, [parsedCampaignId, router]);

  useEffect(() => {
    if (
      campaignData &&
      answersData &&
      !Array.isArray(campaignData) &&
      !isDataLoaded
    ) {
      const dbCampaign = campaignData as Campaign;

      const mapAnswer = (questionNumber: number) => {
        return answersData.find(
          (a: any) => a.questions?.question_number === questionNumber,
        );
      };

      const locAudAns = mapAnswer(1);
      const locAudOrg = locAudAns?.pre_ai_answer || "";
      const locAudAI = locAudAns?.ai_answer || "";
      const locAudFinal = locAudAns?.final_answer || "";

      const challengeAns = mapAnswer(2);
      const challengeOrg = challengeAns?.pre_ai_answer || "";
      const challengeAI = challengeAns?.ai_answer || "";
      const challengeFinal = challengeAns?.final_answer || "";

      const seasonAns = mapAnswer(3);
      const seasonOrg = seasonAns?.pre_ai_answer || "";
      const seasonAI = seasonAns?.ai_answer || "";
      const seasonFinal = seasonAns?.final_answer || "";

      const impactAns = mapAnswer(4);
      const impactOrg = impactAns?.pre_ai_answer || "";
      const impactAI = impactAns?.ai_answer || "";
      const impactFinal = impactAns?.final_answer || "";

      setStoryQuestions({
        q1: locAudAns?.questions?.question || "",
        q2: challengeAns?.questions?.question || "",
        q3: seasonAns?.questions?.question || "",
        q4: impactAns?.questions?.question || "",
      });

      const mappedData: EditCampaignFormData = {
        ...DEFAULT_CAMPAIGN_DATA,
        campaignTitle: dbCampaign.name || "",
        beneficiaryCount: dbCampaign.impact?.toString() || "",
        gardenSize: dbCampaign.size?.toString() || "",
        gardenStatus:
          (dbCampaign.existence as "new" | "existing") || "existing",
        fundraisingGoal: dbCampaign.goal?.toString() || "",
        gardenCity: dbCampaign.city || "",
        gardenState: dbCampaign.state || "",
        gardenCountry: dbCampaign.country || "",
        gardenCategory: dbCampaign.project_category || "",
        gardenBeneficiaries: dbCampaign.project_beneficiaries || [],
        organizationName: dbCampaign.organization_name || "",
        organizationIdentifier: dbCampaign.ein || "",
        mailingStreet1: dbCampaign.mailing_street_1 || "",
        mailingStreet2: dbCampaign.mailing_street_2 || "",
        mailingCity: dbCampaign.mailing_city || "",
        mailingState: dbCampaign.mailing_state || "",
        mailingCountry: dbCampaign.mailing_country || "",
        mailingZip: dbCampaign.mailing_zipcode || "",
        contactFirstName: dbCampaign.contact_first_name || "",
        contactLastName: dbCampaign.contact_last_name || "",
        contactEmail: dbCampaign.contact_email || "",
        contactRole: dbCampaign.contact_role || "",

        storyLocationAndAudience: locAudOrg,
        storyLocationAndAudienceAI: locAudAI,
        storyLocationAndAudienceFinal: locAudFinal,

        storyChallengeOriginal: challengeOrg,
        storyChallengeAI: challengeAI,
        storyChallengeFinal: challengeFinal,

        storySeasonActivityOriginal: seasonOrg,
        storySeasonActivityAI: seasonAI,
        storySeasonActivityFinal: seasonFinal,

        storyCampaignImpactOriginal: impactOrg,
        storyCampaignImpactAI: impactAI,
        storyCampaignImpactFinal: impactFinal,
      };

      setInitialData(mappedData);
      setFormData(mappedData);
      setIsDataLoaded(true);
    }
  }, [campaignData, answersData, isDataLoaded]);

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

      return {
        ...prev,
        gardenBeneficiaries: next,
      };
    });
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (parsedCampaignId === null) return;

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

      // 1. Update the campaign attributes
      await updateCampaignMutation.mutateAsync({
        campaignId: parsedCampaignId,
        campaignData: campaignPayload,
      });

      // 2. Update answer attributes
      if (answersData) {
        const buildAnswerUpdate = (qNum: number, finalValue: string) => {
          const ans = answersData.find(
            (a: any) => a.questions?.question_number === qNum,
          );
          if (ans && ans.answer_id) {
            return updateAnswer(ans.answer_id, { final_answer: finalValue });
          }
          return Promise.resolve(null);
        };

        await Promise.all([
          buildAnswerUpdate(1, formData.storyLocationAndAudienceFinal),
          buildAnswerUpdate(2, formData.storyChallengeFinal),
          buildAnswerUpdate(3, formData.storySeasonActivityFinal),
          buildAnswerUpdate(4, formData.storyCampaignImpactFinal),
        ]);

        queryClient.invalidateQueries({
          queryKey: [parsedCampaignId, "answers", "read"],
        });
      }

      setInitialData(formData);
      setIsSaveModalOpen(false);
      setShowSuccessToast(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Save error:", message);
      setSaveErrorMessage(message);
      setIsSaveModalOpen(false);
      setShowErrorToast(true);
    }
  }, [
    formData,
    parsedCampaignId,
    answersData,
    updateCampaignMutation,
    queryClient,
  ]);

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

  if (isLoadingCampaign || isLoadingAnswers || !isDataLoaded) {
    return <Loading />;
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
              questions={storyQuestions}
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
