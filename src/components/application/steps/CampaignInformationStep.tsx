"use client";

import { Button, TextField } from "@mui/material";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";

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

export default function CampaignInformationStep() {
  const form = useApplicationForm();
  const router = useRouter();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const campaignInformationRef = useRef({
    name: form.state.values.campaignTitle,
    impact: form.state.values.beneficiaryCount
      ? Number(form.state.values.beneficiaryCount)
      : undefined,
    size: form.state.values.gardenSize.trim() || undefined,
    existence: form.state.values.gardenStatus || undefined,
    goal: form.state.values.fundraisingGoal
      ? Number(form.state.values.fundraisingGoal)
      : undefined,
  });
  const saveCampaignInformationDraft = async (
    overrides: Partial<typeof form.state.values> = {},
  ) => {
    const values = {
      ...form.state.values,
      ...overrides,
    };

    const currentPayload = {
      name: values.campaignTitle,
      impact: values.beneficiaryCount
        ? Number(values.beneficiaryCount)
        : undefined,
      size: values.gardenSize.trim() || undefined,
      existence: values.gardenStatus || undefined,
      goal: values.fundraisingGoal ? Number(values.fundraisingGoal) : undefined,
    };

    const changedValues: Partial<typeof currentPayload> = {};

    if (currentPayload.name !== campaignInformationRef.current.name) {
      changedValues.name = currentPayload.name;
    }

    if (currentPayload.impact !== campaignInformationRef.current.impact) {
      changedValues.impact = currentPayload.impact;
    }

    if (currentPayload.size !== campaignInformationRef.current.size) {
      changedValues.size = currentPayload.size;
    }

    if (currentPayload.existence !== campaignInformationRef.current.existence) {
      changedValues.existence = currentPayload.existence;
    }

    if (currentPayload.goal !== campaignInformationRef.current.goal) {
      changedValues.goal = currentPayload.goal;
    }

    if (Object.keys(changedValues).length === 0) {
      return;
    }

    await saveDraftCampaign(changedValues);
    campaignInformationRef.current = currentPayload;
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[640px] flex-col gap-5">
      {/* campaign title */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Campaign Title <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          This will be the public title of your fundraising campaign. Choose
          something clear and recognizable, e.g. Fairview Community Garden,
          Pleasantville Primary School Garden, Holy Jalapeno Church Garden, etc.
        </p>

        <form.Field name="campaignTitle">
          {(field) => (
            <TextField
              label="Campaign Title (Required)"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveCampaignInformationDraft({
                  campaignTitle: e.target.value,
                });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.length > 0}
              helperText={
                field.state.meta.errors.length > 0
                  ? field.state.meta.errors.join(", ")
                  : "60 max characters"
              }
              fullWidth
              variant="standard"
            />
          )}
        </form.Field>
      </div>

      {/* project details & impact */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h2>

        <form.Field name="beneficiaryCount">
          {(field) => (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                About how many people will benefit from this garden this year?
              </p>
              <TextField
                variant="standard"
                fullWidth
                label="Number of people served (Required)"
                value={field.state.value}
                onBlur={async (e) => {
                  field.handleBlur();
                  await saveCampaignInformationDraft({
                    beneficiaryCount: normalizeNumericInput(e.target.value),
                  });
                }}
                onChange={(e) =>
                  field.handleChange(normalizeNumericInput(e.target.value))
                }
                type="number"
                inputProps={{ "aria-label": "About how many people will benefit from this garden this year?" }}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="gardenSize">
          {(field) => (
            <TextField
              label="Approximate garden size or scope (Required)"
              variant="standard"
              fullWidth
              type="text"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveCampaignInformationDraft({
                  gardenSize: e.target.value,
                });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <p className="text-sm pt-2">Is this a new or existing garden?</p>

        <div className="flex flex-col gap-3">
          <form.Field name="gardenStatus">
            {(field) => (
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gardenStatus"
                    value="new"
                    checked={field.state.value === "new"}
                    onChange={async () => {
                      field.handleChange("new");
                      await saveCampaignInformationDraft({
                        gardenStatus: "new",
                      });
                    }}
                    className="w-6 h-6 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm">New garden</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gardenStatus"
                    value="existing"
                    checked={field.state.value === "existing"}
                    onChange={async () => {
                      field.handleChange("existing");
                      await saveCampaignInformationDraft({
                        gardenStatus: "existing",
                      });
                    }}
                    className="w-6 h-6 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm">Existing garden</span>
                </label>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* fundraising goal */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Fundraising Goal <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <form.Field name="fundraisingGoal">
          {(field) => {
            const goalNum = Number(field.state.value);
            const isInvalid = field.state.value !== "" && goalNum < 1;

            return (
              <TextField
                label="Fundraising Goal (USD) (Required)"
                variant="standard"
                fullWidth
                type="number"
                value={field.state.value}
                onBlur={async (e) => {
                  field.handleBlur();
                  await saveCampaignInformationDraft({
                    fundraisingGoal: normalizeNumericInput(e.target.value),
                  });
                }}
                onChange={(e) =>
                  field.handleChange(normalizeNumericInput(e.target.value))
                }
                error={isInvalid}
                helperText={
                  isInvalid ? "Fundraising goal must be greater than $0" : ""
                }
                inputProps={{ min: 2 }}
              />
            );
          }}
        </form.Field>
      </div>

      {/* buttons */}
      <div className="flex w-full flex-col-reverse gap-3 md:flex-row md:justify-between md:gap-0">
        <Button
          component={Link}
          href="/apply/terms"
          variant="outlined"
          size="medium"
          className="w-full md:w-auto"
        >
          Previous Step
        </Button>

        <Button
          component="button"
          variant="contained"
          size="medium"
          className="w-full md:w-auto"
          onClick={async () => {
            await saveCampaignInformationDraft();
            router.push("/apply/garden");
          }}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
