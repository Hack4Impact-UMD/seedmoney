"use client";

import { Button, TextField } from "@mui/material";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import Link from "next/link";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";

export default function CampaignInformationStep() {
  const form = useApplicationForm();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const saveCampaignInformationDraft = async (
    overrides: Partial<typeof form.state.values> = {},
  ) => {
    const values = {
      ...form.state.values,
      ...overrides,
    };

    await saveDraftCampaign({
      name: values.campaignTitle,
      impact: values.beneficiaryCount ? Number(values.beneficiaryCount) : undefined,
      size: values.gardenSize ? Number(values.gardenSize) : undefined,
      existence: values.gardenStatus || undefined,
      goal: values.fundraisingGoal ? Number(values.fundraisingGoal) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-[700px] m-15">
      {/* campaign title */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
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
              label="Campaign Title"
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
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h2>

        <form.Field name="beneficiaryCount">
          {(field) => (
            <TextField
              label="About how many people will benefit from this garden this year?"
              variant="standard"
              fullWidth
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveCampaignInformationDraft({
                  beneficiaryCount: e.target.value,
                });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              type="number"
            />
          )}
        </form.Field>

        <form.Field name="gardenSize">
          {(field) => (
            <TextField
              label="Approximate garden size or scope"
              helperText="Examples: one raised bed, multiple sites, two-acre farm."
              variant="standard"
              fullWidth
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
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Fundraising Goal <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <form.Field name="fundraisingGoal">
          {(field) => (
            <TextField
              label="Fundraising Goal (USD)"
              variant="standard"
              fullWidth
              type="number"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveCampaignInformationDraft({
                  fundraisingGoal: e.target.value,
                });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      </div>

      {/* buttons */}
      <div className="flex justify-between">
        <Button
          component={Link}
          href="/apply/terms"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        <Button
          component={Link}
          href="/apply/garden"
          variant="contained"
          size="medium"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
