"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, MenuItem, TextField } from "@mui/material";
import {
  useAgreementGate,
  useApplicationForm,
  useDraftCampaignId,
  useLastSaved,
  usePendingImageCrops,
} from "@/src/components/application/ApplicationFormProvider";
import { getApplicationCompletionState } from "@/src/components/application/applicationStepState";
import { notFound, useRouter } from "next/navigation";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useReplaceCampaignImage from "@/src/hooks/campaign-image-records/useReplaceCampaignImage";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadQuestion from "@/src/hooks/questions/useReadQuestion";
import useCreateOriginalAnswer from "@/src/hooks/answers/useCreateOriginalAnswer";
import { applicationGardenCategories } from "@/src/constants/gardenCategories";
import {
  COUNTRIES,
  STATES,
} from "@/src/components/application/addressOptions";
import { createBrowserClient } from "@/src/lib/supabase-client";

const storyAnswerMinChars = 200;
const storyAnswerMaxChars = 1000;

function normalizeNumericInput(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return "";
  }

  const decimalMatch = trimmedValue.match(/[.,](?=\d{1,2}$)/);
  const integerPortion = decimalMatch
    ? trimmedValue.slice(0, decimalMatch.index)
    : trimmedValue;
  const digitsOnly = integerPortion.replace(/\D/g, "");

  if (digitsOnly === "") {
    return "";
  }

  return digitsOnly.replace(/^0+(?=\d)/, "");
}

function formatOrganizationIdentifier(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function isUsCountry(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue === "us" || normalizedValue === "united states";
}

function getFormattedSaveTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function EditableValueRow({
  label,
  value,
  helperText,
  multiline = false,
  type = "text",
  required = false,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  value: string | number;
  helperText?: string;
  multiline?: boolean;
  type?: string;
  required?: boolean;
  error?: boolean;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void | Promise<void>;
}) {
  const displayValue = String(value ?? "");
  const isMissing = required && displayValue.trim().length === 0;

  return (
    <TextField
      variant="standard"
      fullWidth
      label={label}
      type={type}
      multiline={multiline}
      minRows={multiline ? 4 : undefined}
      value={displayValue}
      error={error ?? isMissing}
      helperText={helperText}
      onChange={(event) => onChange(event.target.value)}
      onBlur={async (event) => {
        try {
          await onBlur?.(event.target.value);
        } catch (error) {
          console.error("Error saving review field:", error);
        }
      }}
    />
  );
}

function EditableSelectRow({
  label,
  value,
  options,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  required?: boolean;
  onChange: (value: string) => void | Promise<void>;
}) {
  const hasOption = options.some((option) => option.value === value);

  return (
    <TextField
      select
      variant="standard"
      fullWidth
      label={label}
      value={value}
      error={required && value.trim().length === 0}
      onChange={async (event) => {
        try {
          await onChange(event.target.value);
        } catch (error) {
          console.error("Error saving review field:", error);
        }
      }}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>

      {value && !hasOption && <MenuItem value={value}>{value}</MenuItem>}

      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function ReviewBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <Image src="/icons/error.svg" width={18} height={18} alt="error" />
        <span>{message}</span>
      </div>
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
  const { setLastSaved } = useLastSaved();
  const {
    pendingMainPhotoCrop,
    setPendingMainPhotoCrop,
    pendingSupportingPhotoCrops,
    setPendingSupportingPhotoCrops,
  } = usePendingImageCrops();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const createOriginalAnswerMutation = useCreateOriginalAnswer();
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
  const hasValidFundraisingGoal = goalValue > 1;
  const showFundraisingGoalError =
    values.fundraisingGoal !== "" && !hasValidFundraisingGoal;
  const canSubmit =
    reviewComplete && !!currentCompetitionData && hasValidFundraisingGoal;
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

  const saveCampaignInformationDraft = async (
    overrides: Partial<typeof values> = {},
  ) => {
    const nextValues = {
      ...form.state.values,
      ...overrides,
    };

    await saveDraftCampaign({
      name: nextValues.campaignTitle,
      impact: nextValues.beneficiaryCount
        ? Number(nextValues.beneficiaryCount)
        : undefined,
      size: nextValues.gardenSize.trim() || undefined,
      existence: nextValues.gardenStatus || undefined,
      goal: nextValues.fundraisingGoal
        ? Number(nextValues.fundraisingGoal)
        : undefined,
    });
  };

  const saveGardenInformationDraft = async (
    overrides: Partial<typeof values> = {},
  ) => {
    const nextValues = {
      ...form.state.values,
      ...overrides,
    };

    await saveDraftCampaign({
      city: nextValues.gardenCity,
      state: nextValues.gardenState,
      country: nextValues.gardenCountry,
      project_category: nextValues.gardenCategory,
      project_beneficiaries: nextValues.gardenBeneficiaries,
    });
  };

  const saveContactDraft = async (overrides: Partial<typeof values> = {}) => {
    const nextValues = {
      ...form.state.values,
      ...overrides,
    };

    await saveDraftCampaign({
      organization_name: nextValues.organizationName,
      ein: nextValues.organizationIdentifier,
      mailing_street_1: nextValues.mailingStreet1,
      mailing_street_2: nextValues.mailingStreet2,
      mailing_city: nextValues.mailingCity,
      mailing_state: nextValues.mailingState,
      mailing_zipcode: nextValues.mailingZip,
      mailing_country: nextValues.mailingCountry,
      contact_first_name: nextValues.contactFirstName,
      contact_last_name: nextValues.contactLastName,
      contact_email: nextValues.contactEmail,
      contact_role: nextValues.contactRole,
    });
  };

  const saveStoryAnswer = async (questionId: number, originalAnswer: string) => {
    const campaignId = draftCampaignId ?? (await saveDraftCampaign({}));

    await createOriginalAnswerMutation.mutateAsync({
      campaignId,
      questionId,
      originalAnswer,
    });
    setLastSaved(getFormattedSaveTime());
  };

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
        const beaconPayload = new Blob([requestBody], {
          type: "application/json",
        });

        const beaconQueued =
          typeof navigator !== "undefined" &&
          typeof navigator.sendBeacon === "function" &&
          navigator.sendBeacon("/api/ai-polish", beaconPayload);

        if (!beaconQueued) {
          void fetch("/api/ai-polish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: requestBody,
            keepalive: true,
            credentials: "same-origin",
          }).catch((error) => {
            console.error(
              "Error creating AI-polished answers after submit:",
              error,
            );
          });
        }
      } catch (error) {
        console.error("Error starting AI-polished answer creation:", error);
      }
    }

    router.push(`/dashboard/${campaignId}?submitted=1`);
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[640px] flex-col gap-5 pb-12">
      <h2 className="text-lg font-semibold">Campaign Information</h2>

      {!campaignComplete && (
        <ReviewBanner
          message='Please complete "Campaign Information"'
        />
      )}
      {showFundraisingGoalError && (
        <ReviewBanner
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

        <EditableValueRow
          label="Campaign Title"
          value={values.campaignTitle}
          required
          onChange={(value) => form.setFieldValue("campaignTitle", value)}
          onBlur={(value) =>
            saveCampaignInformationDraft({ campaignTitle: value })
          }
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-5">
        <h3 className="text-[17px] font-medium">
          Project Details & Impact <span className="text-red-500">*</span>
        </h3>

        <EditableValueRow
          label="About how many people will benefit from this garden this year?"
          value={values.beneficiaryCount}
          required
          type="number"
          onChange={(value) =>
            form.setFieldValue("beneficiaryCount", normalizeNumericInput(value))
          }
          onBlur={(value) =>
            saveCampaignInformationDraft({
              beneficiaryCount: normalizeNumericInput(value),
            })
          }
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">
            Is this a new or existing garden?
          </label>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reviewGardenStatus"
                value="new"
                checked={values.gardenStatus === "new"}
                onChange={async () => {
                  form.setFieldValue("gardenStatus", "new");
                  await saveCampaignInformationDraft({ gardenStatus: "new" });
                }}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
              <span>New - this garden is being started this year</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="reviewGardenStatus"
                value="existing"
                checked={values.gardenStatus === "existing"}
                onChange={async () => {
                  form.setFieldValue("gardenStatus", "existing");
                  await saveCampaignInformationDraft({
                    gardenStatus: "existing",
                  });
                }}
                className="w-6 h-6 accent-blue-600 cursor-pointer"
              />
              <span>
                Existing - this garden has been operating for one or more
                seasons
              </span>
            </label>
          </div>
        </div>

        <EditableValueRow
          label="Approximate garden size or scope (Optional)"
          value={values.gardenSize || ""}
          onChange={(value) => form.setFieldValue("gardenSize", value)}
          onBlur={(value) => saveCampaignInformationDraft({ gardenSize: value })}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Fundraising Goal <span className="text-red-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <EditableValueRow
          label="Fundraising Goal (USD)"
          value={values.fundraisingGoal}
          required
          type="number"
          error={showFundraisingGoalError}
          helperText={
            showFundraisingGoalError
              ? "Fundraising goal must be greater than $1"
              : undefined
          }
          onChange={(value) =>
            form.setFieldValue("fundraisingGoal", normalizeNumericInput(value))
          }
          onBlur={(value) =>
            saveCampaignInformationDraft({
              fundraisingGoal: normalizeNumericInput(value),
            })
          }
        />
      </div>

      <h2 className="text-lg font-semibold">Garden Information</h2>

      {!gardenComplete && (
        <ReviewBanner
          message='Please complete "Garden Information"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-5">
        <h3 className="text-[17px] font-medium">
          Garden Location <span className="text-red-500">*</span>
        </h3>

        <EditableSelectRow
          label="Country"
          value={values.gardenCountry}
          required
          options={COUNTRIES.map((country) => ({
            value: country,
            label: formatCountry(country),
          }))}
          onChange={async (value) => {
            const shouldClearState = values.gardenCountry !== value;
            form.setFieldValue("gardenCountry", value);

            if (shouldClearState) {
              form.setFieldValue("gardenState", "");
            }

            await saveGardenInformationDraft({
              gardenCountry: value,
              ...(shouldClearState ? { gardenState: "" } : {}),
            });
          }}
        />
        {isUsCountry(values.gardenCountry) ? (
          <EditableSelectRow
            label="State / Province"
            value={values.gardenState}
            required
            options={STATES.map((state) => ({
              value: state.code,
              label: state.name,
            }))}
            onChange={async (value) => {
              form.setFieldValue("gardenState", value);
              await saveGardenInformationDraft({ gardenState: value });
            }}
          />
        ) : (
          <EditableValueRow
            label="State / Province"
            value={values.gardenState}
            required
            helperText="Write N/A if not applicable"
            onChange={(value) => form.setFieldValue("gardenState", value)}
            onBlur={(value) =>
              saveGardenInformationDraft({ gardenState: value })
            }
          />
        )}
        <EditableValueRow
          label="City"
          value={values.gardenCity}
          required
          onChange={(value) => form.setFieldValue("gardenCity", value)}
          onBlur={(value) => saveGardenInformationDraft({ gardenCity: value })}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-2">
        <h3 className="text-[17px] font-medium">
          Primary Project Category <span className="text-red-500">*</span>
        </h3>

        <EditableSelectRow
          label="Category"
          value={values.gardenCategory}
          required
          options={applicationGardenCategories.map((category) => ({
            value: category,
            label: category,
          }))}
          onChange={async (value) => {
            form.setFieldValue("gardenCategory", value);
            await saveGardenInformationDraft({ gardenCategory: value });
          }}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-2">
        <h3 className="text-[17px] font-medium">
          Beneficiary Populations Served{" "}
          <span className="text-red-500">*</span>
        </h3>

        <EditableValueRow
          label="Beneficiary populations"
          value={values.gardenBeneficiaries.join(", ")}
          required
          helperText="Separate each population with a comma."
          onChange={(value) =>
            form.setFieldValue(
              "gardenBeneficiaries",
              value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          onBlur={(value) =>
            saveGardenInformationDraft({
              gardenBeneficiaries: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <h2 className="text-lg font-semibold">Garden Story</h2>

      {!storyComplete && (
        <ReviewBanner
          message='Please complete "Garden Story"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-8">
        <h3 className="text-[17px] font-medium">
          Garden Story <span className="text-red-500">*</span>
        </h3>

        <p className="text-sm">2-3 sentences each</p>

        <EditableValueRow
          label={question1.question}
          value={values.storyLocationAndAudience}
          required
          multiline
          error={
            values.storyLocationAndAudience.trim().length > 0 &&
            values.storyLocationAndAudience.trim().length < storyAnswerMinChars
          }
          helperText={`${values.storyLocationAndAudience.length} / ${storyAnswerMaxChars}`}
          onChange={(value) =>
            form.setFieldValue(
              "storyLocationAndAudience",
              value.slice(0, storyAnswerMaxChars),
            )
          }
          onBlur={(value) =>
            saveStoryAnswer(
              question1.question_id,
              value.slice(0, storyAnswerMaxChars),
            )
          }
        />
        <EditableValueRow
          label={question2.question}
          value={values.storyChallenge}
          required
          multiline
          error={
            values.storyChallenge.trim().length > 0 &&
            values.storyChallenge.trim().length < storyAnswerMinChars
          }
          helperText={`${values.storyChallenge.length} / ${storyAnswerMaxChars}`}
          onChange={(value) =>
            form.setFieldValue(
              "storyChallenge",
              value.slice(0, storyAnswerMaxChars),
            )
          }
          onBlur={(value) =>
            saveStoryAnswer(
              question2.question_id,
              value.slice(0, storyAnswerMaxChars),
            )
          }
        />
        <EditableValueRow
          label={question3.question}
          value={values.storySeasonActivity}
          required
          multiline
          error={
            values.storySeasonActivity.trim().length > 0 &&
            values.storySeasonActivity.trim().length < storyAnswerMinChars
          }
          helperText={`${values.storySeasonActivity.length} / ${storyAnswerMaxChars}`}
          onChange={(value) =>
            form.setFieldValue(
              "storySeasonActivity",
              value.slice(0, storyAnswerMaxChars),
            )
          }
          onBlur={(value) =>
            saveStoryAnswer(
              question3.question_id,
              value.slice(0, storyAnswerMaxChars),
            )
          }
        />
        <EditableValueRow
          label={question4.question}
          value={values.storyCampaignImpact}
          required
          multiline
          error={
            values.storyCampaignImpact.trim().length > 0 &&
            values.storyCampaignImpact.trim().length < storyAnswerMinChars
          }
          helperText={`${values.storyCampaignImpact.length} / ${storyAnswerMaxChars}`}
          onChange={(value) =>
            form.setFieldValue(
              "storyCampaignImpact",
              value.slice(0, storyAnswerMaxChars),
            )
          }
          onBlur={(value) =>
            saveStoryAnswer(
              question4.question_id,
              value.slice(0, storyAnswerMaxChars),
            )
          }
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
          message='Please complete "Contact Information"'
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Organization Information <span className="text-red-500">*</span>
        </h3>

        <EditableValueRow
          label="Legal Name of Beneficiary Organization"
          value={values.organizationName}
          required
          onChange={(value) => form.setFieldValue("organizationName", value)}
          onBlur={(value) => saveContactDraft({ organizationName: value })}
        />
        <EditableValueRow
          label="EIN or Public-Sector Identifier"
          value={values.organizationIdentifier}
          required
          onChange={(value) =>
            form.setFieldValue(
              "organizationIdentifier",
              formatOrganizationIdentifier(value),
            )
          }
          onBlur={(value) =>
            saveContactDraft({
              organizationIdentifier: formatOrganizationIdentifier(value),
            })
          }
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-red-500">*</span>
        </h3>

        <EditableValueRow
          label="Address Line 1"
          value={values.mailingStreet1}
          required
          onChange={(value) => form.setFieldValue("mailingStreet1", value)}
          onBlur={(value) => saveContactDraft({ mailingStreet1: value })}
        />
        <EditableValueRow
          label="Apartment, suite, etc. (Optional)"
          value={values.mailingStreet2}
          onChange={(value) => form.setFieldValue("mailingStreet2", value)}
          onBlur={(value) => saveContactDraft({ mailingStreet2: value })}
        />
        <EditableValueRow
          label="City or Town"
          value={values.mailingCity}
          required
          onChange={(value) => form.setFieldValue("mailingCity", value)}
          onBlur={(value) => saveContactDraft({ mailingCity: value })}
        />
        {isUsCountry(values.mailingCountry) ? (
          <EditableSelectRow
            label="State or Province"
            value={values.mailingState}
            required
            options={STATES.map((state) => ({
              value: state.code,
              label: state.name,
            }))}
            onChange={async (value) => {
              form.setFieldValue("mailingState", value);
              await saveContactDraft({ mailingState: value });
            }}
          />
        ) : (
          <EditableValueRow
            label="State or Province"
            value={values.mailingState}
            required
            helperText="Write N/A if not applicable"
            onChange={(value) => form.setFieldValue("mailingState", value)}
            onBlur={(value) => saveContactDraft({ mailingState: value })}
          />
        )}
        <EditableValueRow
          label="ZIP/Postal Code"
          value={values.mailingZip}
          required
          onChange={(value) => form.setFieldValue("mailingZip", value)}
          onBlur={(value) => saveContactDraft({ mailingZip: value })}
        />
        <EditableSelectRow
          label="Country"
          value={values.mailingCountry}
          required
          options={COUNTRIES.map((country) => ({
            value: country,
            label: formatCountry(country),
          }))}
          onChange={async (value) => {
            const shouldClearState = values.mailingCountry !== value;
            form.setFieldValue("mailingCountry", value);

            if (shouldClearState) {
              form.setFieldValue("mailingState", "");
            }

            await saveContactDraft({
              mailingCountry: value,
              ...(shouldClearState ? { mailingState: "" } : {}),
            });
          }}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-5 flex flex-col gap-4">
        <h3 className="text-[17px] font-medium">
          Primary Contact Information <span className="text-red-500">*</span>
        </h3>

        <EditableValueRow
          label="First Name"
          value={values.contactFirstName}
          required
          onChange={(value) => form.setFieldValue("contactFirstName", value)}
          onBlur={(value) => saveContactDraft({ contactFirstName: value })}
        />
        <EditableValueRow
          label="Last Name"
          value={values.contactLastName}
          required
          onChange={(value) => form.setFieldValue("contactLastName", value)}
          onBlur={(value) => saveContactDraft({ contactLastName: value })}
        />
        <EditableValueRow
          label="Email"
          value={values.contactEmail}
          required
          onChange={(value) => form.setFieldValue("contactEmail", value)}
          onBlur={(value) => saveContactDraft({ contactEmail: value })}
        />
        <EditableValueRow
          label="Role or Title (Optional)"
          value={values.contactRole}
          onChange={(value) => form.setFieldValue("contactRole", value)}
          onBlur={(value) => saveContactDraft({ contactRole: value })}
        />
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
