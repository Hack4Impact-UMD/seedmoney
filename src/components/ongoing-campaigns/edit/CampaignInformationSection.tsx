"use client";

import { TextField } from "@mui/material";
import {
  EditCampaignFormData,
  SetFieldValue,
  TextChangeHandler,
} from "./types";

function normalizeNumericInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly === "") {
    return "";
  }

  return digitsOnly.replace(/^0+(?=\d)/, "");
}

interface CampaignInformationSectionProps {
  formData: EditCampaignFormData;
  onTextChange: TextChangeHandler;
  setFieldValue: SetFieldValue;
}

export default function CampaignInformationSection({
  formData,
  onTextChange,
  setFieldValue,
}: CampaignInformationSectionProps) {
  return (
    <>
      <h1 className="text-2xl font-bold">Campaign Information</h1>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Campaign Title <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          The name of your garden, e.g. Fairview Community Garden, Pleasantville
          Primary School Garden, Holy Jalapeno Church Garden, etc.
        </p>

        <TextField
          label="Campaign Title"
          value={formData.campaignTitle}
          onChange={onTextChange("campaignTitle")}
          helperText="60 max characters"
          fullWidth
          variant="standard"
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h2>

        <TextField
          label="About how many people will benefit from this garden this year?"
          variant="standard"
          fullWidth
          value={formData.beneficiaryCount}
          onChange={(event) =>
            setFieldValue(
              "beneficiaryCount",
              normalizeNumericInput(event.target.value),
            )
          }
          type="number"
          inputProps={{ min: 0 }}
        />

        <p className="pt-2 text-sm">Is this a new or existing garden?</p>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="gardenStatus"
              value="new"
              checked={formData.gardenStatus === "new"}
              onChange={() => setFieldValue("gardenStatus", "new")}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm">New garden</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="gardenStatus"
              value="existing"
              checked={formData.gardenStatus === "existing"}
              onChange={() => setFieldValue("gardenStatus", "existing")}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm">Existing garden</span>
          </label>
        </div>

        <TextField
          label="Approximate garden size or scope"
          variant="standard"
          fullWidth
          value={formData.gardenSize}
          onChange={(event) =>
            setFieldValue(
              "gardenSize",
              normalizeNumericInput(event.target.value),
            )
          }
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Fundraising Goal <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <TextField
          label="Fundraising Goal (USD)"
          variant="standard"
          fullWidth
          type="number"
          value={formData.fundraisingGoal}
          onChange={(event) =>
            setFieldValue(
              "fundraisingGoal",
              normalizeNumericInput(event.target.value),
            )
          }
          inputProps={{ min: 0 }}
        />
      </div>
    </>
  );
}
