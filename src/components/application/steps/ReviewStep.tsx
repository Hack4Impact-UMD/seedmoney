"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import {
  useAgreementGate,
  useApplicationForm,
  useDraftCampaignId,
  usePendingImageCrops,
} from "@/src/components/application/ApplicationFormProvider";
import { getApplicationCompletionState } from "@/src/components/application/applicationStepState";
import { notFound, useRouter } from "next/navigation";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useReplaceCampaignImage from "@/src/hooks/campaign-image-records/useReplaceCampaignImage";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadQuestion from "@/src/hooks/questions/useReadQuestion";
import { createBrowserClient } from "@/src/lib/supabase-client";
const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function ValueRow({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string | number;
  required?: boolean;
}) {
  const displayValue = String(value ?? "");
  const isMissing = required && displayValue.trim().length === 0;

  return (
    <div className="flex flex-col gap-1">
      <label
        className={`text-sm ${isMissing ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}
      </label>
      {isMissing ? (
        <div className="border-b border-[#D32F2F] mt-2" />
      ) : (
        <>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
            {displayValue}
          </p>
          <div className="border-b border-gray-300" />
        </>
      )}
    </div>
  );
}

function ReviewBanner({ href, message }: { href: string; message: string }) {
  return (
    <div className="flex justify-between items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <Image src="/icons/error.svg" width={18} height={18} alt="error" />
        <span>{message}</span>
      </div>

      <Link
        href={href}
        className="flex items-center gap-2 text-[#D32F2F] font-medium"
      >
        <Image src="/icons/pencil.svg" width={16} height={16} alt="edit" />
        EDIT
      </Link>
    </div>
  );
}

function formatCountry(value: string) {
  return value === "US" ? "United States" : value;
}

export default function ReviewSubmitPage() {
  const form = useApplicationForm();
  const router = useRouter();
  const { hasPassedAgreement } = useAgreementGate();
  const { draftCampaignId } = useDraftCampaignId();
  const {
    pendingMainPhotoCrop,
    setPendingMainPhotoCrop,
    pendingSupportingPhotoCrops,
    setPendingSupportingPhotoCrops,
  } = usePendingImageCrops();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const updateCampaign = useUpdateCampaign();
  const replaceCampaignImage = useReplaceCampaignImage();
  const { data: currentCompetitionData } = useReadCurrentCompetition();
  const { data: question1, isLoading: isLoadingQuestion1 } = useReadQuestion(1);
  const { data: question2, isLoading: isLoadingQuestion2 } = useReadQuestion(2);
  const { data: question3, isLoading: isLoadingQuestion3 } = useReadQuestion(3);
  const { data: question4, isLoading: isLoadingQuestion4 } = useReadQuestion(4);
  const values = form.state.values;
  const {
    campaignComplete,
    gardenComplete,
    storyComplete,
    contactComplete,
    reviewComplete,
  } = getApplicationCompletionState(values, hasPassedAgreement);
  const goalValue = Number(values.fundraisingGoal);
  const canSubmit = reviewComplete && !!currentCompetitionData && goalValue > 1;
  const isLoadingQuestions =
    isLoadingQuestion1 ||
    isLoadingQuestion2 ||
    isLoadingQuestion3 ||
    isLoadingQuestion4;

  if (isLoadingQuestions) {
    return <div>Loading...</div>;
  }

  if (!question1 || !question2 || !question3 || !question4) {
    notFound();
  }

  const handleSubmitApplication = async () => {
    if (!currentCompetitionData) {
      return;
    }

    const campaignId = draftCampaignId ?? (await saveDraftCampaign({}));

    if (pendingMainPhotoCrop && values.mainPhotoStoragePath) {
      const replacedMainPhoto = await replaceCampaignImage.mutateAsync({
        file: pendingMainPhotoCrop,
        campaignId,
        oldStoragePath: values.mainPhotoStoragePath,
      });
      form.setFieldValue("mainPhotoStoragePath", replacedMainPhoto.storage_path);
      setPendingMainPhotoCrop(null);
    }

    let nextSupportingPhotoStoragePaths = [
      ...values.supportingPhotoStoragePaths,
    ];

    for (const storagePath of values.supportingPhotoStoragePaths) {
      const croppedFile = pendingSupportingPhotoCrops[storagePath];
      if (!croppedFile) {
        continue;
      }

      const replacedSupportingPhoto = await replaceCampaignImage.mutateAsync({
        file: croppedFile,
        campaignId,
        oldStoragePath: storagePath,
      });

      nextSupportingPhotoStoragePaths = nextSupportingPhotoStoragePaths.map(
        (currentStoragePath) =>
          currentStoragePath === storagePath
            ? replacedSupportingPhoto.storage_path
            : currentStoragePath,
      );
    }

    form.setFieldValue(
      "supportingPhotoStoragePaths",
      nextSupportingPhotoStoragePaths,
    );
    setPendingSupportingPhotoCrops({});

    await form.handleSubmit();

    const aiPayload = values.aiOptIn
      ? {
          campaignId,
          questions: [
            {
              questionId: question1.question_id,
              questionText: question1.question,
              originalText: values.storyLocationAndAudience,
            },
            {
              questionId: question2.question_id,
              questionText: question2.question,
              originalText: values.storyChallenge,
            },
            {
              questionId: question3.question_id,
              questionText: question3.question,
              originalText: values.storySeasonActivity,
            },
            {
              questionId: question4.question_id,
              questionText: question4.question,
              originalText: values.storyCampaignImpact,
            },
          ],
        }
      : null;

    if (aiPayload && typeof window !== "undefined") {
      try {
        const requestBody = JSON.stringify(aiPayload);
        const response = await fetch("/api/ai-polish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          credentials: "same-origin",
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;

          console.error(
            "Error creating AI-polished answers before submit:",
            errorBody?.error ?? response.statusText,
          );
        }
      } catch (error) {
        console.error("Error starting AI-polished answer creation:", error);
      }
    }

    await updateCampaign.mutateAsync({
      campaignId,
      campaignData: {
        status: "pending",
        competition_id: currentCompetitionData.competition_id,
        raised: 0,
        donors: 0,
        givebutter_id: "",
        givebutter_slug: "",
        givebutterlink: "",
      },
    });

    try {
      const supabase = createBrowserClient();
      const { error: emailError } = await supabase.functions.invoke(
        "send-campaign-email",
        {
          body: {
            type: "campaign_submitted",
            campaign_id: campaignId,
          },
        },
      );

      if (emailError) {
        console.error(
          "Error sending campaign submitted email:",
          emailError.message,
        );
      }
    } catch (emailError) {
      console.error("Error sending campaign submitted email:", emailError);
    }

    router.push(`/dashboard/${campaignId}?submitted=1`);
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[640px] flex-col gap-5 pb-12">
      <h2 className="text-lg font-semibold">Campaign Information</h2>

      {!campaignComplete && (
        <ReviewBanner
          href="/apply/campaign"
          message='Please complete "Campaign Information"'
        />
      )}
      {goalValue < 1 && (
        <ReviewBanner
          href="/apply/campaign"
          message="Fundraising goal must be greater than $1"
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-[17px] font-medium">
            Campaign Title <span className="text-red-500">*</span>
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            The name of your garden, e.g. Fairview Community Garden,
            Pleasantville Primary School Garden, Holy Jalapeno Church Garden.
          </p>
        </div>

        <ValueRow
          label="Campaign Title"
          value={values.campaignTitle}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-5">
        <h3 className="text-[17px] font-medium">
          Project Details & Impact <span className="text-red-500">*</span>
        </h3>

        <ValueRow
          label="About how many people will benefit from this garden this year?"
          value={values.beneficiaryCount}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">
            Is this a new or existing garden?
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  values.gardenStatus === "new"
                    ? "border-blue-600"
                    : "border-gray-400"
                } flex items-center justify-center`}
              >
                {values.gardenStatus === "new" && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span>New - this garden is being started this year</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  values.gardenStatus === "existing"
                    ? "border-blue-600"
                    : "border-gray-400"
                } flex items-center justify-center`}
              >
                {values.gardenStatus === "existing" && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span>
                Existing - this garden has been operating for one or more
                seasons
              </span>
            </div>
          </div>
        </div>

        <ValueRow
          label="Approximate garden size or scope (Optional)"
          value={values.gardenSize || ""}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Fundraising Goal <span className="text-red-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <ValueRow
          label="Fundraising Goal (USD)"
          value={values.fundraisingGoal}
          required
        />
      </div>

      <h2 className="text-lg font-semibold">Garden Information</h2>

      {!gardenComplete && (
        <ReviewBanner
          href="/apply/garden"
          message='Please complete "Garden Information"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-5">
        <h3 className="text-[17px] font-medium">
          Garden Location <span className="text-red-500">*</span>
        </h3>

        <ValueRow
          label="Country"
          value={formatCountry(values.gardenCountry)}
          required
        />
        <ValueRow
          label="State / Province"
          value={values.gardenState}
          required
        />
        <ValueRow label="City" value={values.gardenCity} required />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-2">
        <h3 className="text-[17px] font-medium">
          Primary Project Category <span className="text-red-500">*</span>
        </h3>

        <ValueRow label="Category" value={values.gardenCategory} required />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-2">
        <h3 className="text-[17px] font-medium">
          Beneficiary Populations Served{" "}
          <span className="text-red-500">*</span>
        </h3>

        <p>
          {values.gardenBeneficiaries.length > 0
            ? values.gardenBeneficiaries.join(", ")
            : ""}
        </p>
        <div
          className={`border-b ${
            values.gardenBeneficiaries.length > 0
              ? "border-gray-300"
              : "border-[#D32F2F]"
          }`}
        />
      </div>

      <h2 className="text-lg font-semibold">Garden Story</h2>

      {!storyComplete && (
        <ReviewBanner
          href="/apply/story"
          message='Please complete "Garden Story"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-8">
        <h3 className="text-[17px] font-medium">
          Garden Story <span className="text-red-500">*</span>
        </h3>

        <p className="text-sm">2-3 sentences each</p>

        <ValueRow
          label={question1.question}
          value={values.storyLocationAndAudience}
          required
        />
        <ValueRow
          label={question2.question}
          value={values.storyChallenge}
          required
        />
        <ValueRow
          label={question3.question}
          value={values.storySeasonActivity}
          required
        />
        <ValueRow
          label={question4.question}
          value={values.storyCampaignImpact}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Main Photo <span className="text-red-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>

        {values.mainPhoto ? (
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[650/358] overflow-hidden border border-gray-300">
              <img
                src={values.mainPhoto}
                alt={values.mainPhotoName || "Main photo"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="rounded-lg border border-black/10 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">
                {values.mainPhotoName || "Uploaded image"}
              </p>
              <p className="text-[13px] text-gray-500">
                {Math.round(values.mainPhotoSize / 1000)}kb
                <span className="mx-1.5 text-[10px]">&bull;</span>
                Complete
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[#D32F2F]">
            <div
              style={{
                filter:
                  "invert(27%) sepia(80%) saturate(800%) hue-rotate(330deg) brightness(85%)",
              }}
            >
              <Image
                src="/icons/upload-icon.svg"
                width={20}
                height={20}
                alt="upload status"
              />
            </div>

            <div>
              <p>Main photo is required.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-5">
        <h3 className="text-[17px] font-medium">Supporting Photos (Optional)</h3>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your
          garden’s story.
        </p>

        {values.supportingPhotos.length > 0 ? (
          <div className="flex flex-col gap-6">
            {values.supportingPhotos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="flex flex-col gap-4">
                <div className="w-full aspect-[650/358] overflow-hidden border border-gray-300">
                  <img
                    src={photo}
                    alt={
                      values.supportingPhotoNames[index] || "Supporting photo"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-lg border border-black/10 px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">
                    {values.supportingPhotoNames[index] || "Uploaded image"}
                  </p>
                  <p className="text-[13px] text-gray-500">
                    {Math.round(
                      (values.supportingPhotoSizes[index] ?? 0) / 1000,
                    )}
                    kb
                    <span className="mx-1.5 text-[10px]">&bull;</span>
                    Complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No supporting photos uploaded.
          </p>
        )}
      </div>

      <h2 className="text-lg font-semibold">Contact Information</h2>

      {!contactComplete && (
        <ReviewBanner
          href="/apply/contact"
          message='Please complete "Contact Information"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Organization Information <span className="text-red-500">*</span>
        </h3>

        <ValueRow
          label="Legal Name of Beneficiary Organization"
          value={values.organizationName}
          required
        />
        <ValueRow
          label="EIN or Public-Sector Identifier"
          value={values.organizationIdentifier}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-red-500">*</span>
        </h3>

        <ValueRow
          label="Address Line 1"
          value={values.mailingStreet1}
          required
        />
        <ValueRow
          label="Apartment, suite, etc. (Optional)"
          value={values.mailingStreet2}
        />
        <ValueRow label="City or Town" value={values.mailingCity} required />
        <ValueRow
          label="State or Province"
          value={stateNames[values.mailingState] ?? values.mailingState}
          required
        />
        <ValueRow
          label="ZIP/Postal Code"
          value={values.mailingZip}
          required
        />
        <ValueRow
          label="Country"
          value={formatCountry(values.mailingCountry)}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Primary Contact Information <span className="text-red-500">*</span>
        </h3>

        <ValueRow label="First Name" value={values.contactFirstName} required />
        <ValueRow label="Last Name" value={values.contactLastName} required />
        <ValueRow label="Email" value={values.contactEmail} required />
        <ValueRow label="Role or Title (Optional)" value={values.contactRole} />
      </div>

      <div className="flex w-full flex-col-reverse gap-3 md:flex-row md:justify-between md:gap-0">
        <Button
          component={Link}
          href="/apply/contact"
          variant="outlined"
          size="medium"
          className="w-full md:w-auto"
        >
          Previous Step
        </Button>

        <Button
          component="button"
          variant={canSubmit ? "contained" : "text"}
          className={
            canSubmit
              ? "w-full md:w-auto !px-4"
              : "w-full md:w-auto !bg-[#E0E0E0] !px-4"
          }
          size="medium"
          disabled={!canSubmit}
          onClick={async () => {
            if (!canSubmit) {
              return;
            }

            await handleSubmitApplication();
          }}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}
