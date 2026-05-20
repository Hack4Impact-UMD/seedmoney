"use client";

import { TextField } from "@mui/material";

import {
  EditCampaignFormData,
  SetFieldValue,
  TextChangeHandler,
} from "@/src/types/frontend/campaignEdit";

interface GardenInformationSectionProps {
  formData: EditCampaignFormData;
  categoryOptions: string[];
  beneficiaryOptions: string[];
  onTextChange: TextChangeHandler;
  setFieldValue: SetFieldValue;
  onToggleBeneficiary: (option: string) => void;
}

const MAX_BENEFICIARY_SELECTIONS = 3;

export default function GardenInformationSection({
  formData,
  categoryOptions,
  beneficiaryOptions,
  onTextChange,
  setFieldValue,
  onToggleBeneficiary,
}: GardenInformationSectionProps) {
  return (
    <>
      <h1 className="text-2xl font-bold">Garden Information</h1>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Garden Location <span className="text-orange-500">*</span>
        </h2>

        <TextField
          label="Country (Required)"
          variant="standard"
          fullWidth
          value={formData.gardenCountry}
          onChange={onTextChange("gardenCountry")}
        />

        <TextField
          label="State / Province (Required)"
          variant="standard"
          fullWidth
          value={formData.gardenState}
          onChange={onTextChange("gardenState")}
        />

        <TextField
          label="City or Town (Required)"
          variant="standard"
          fullWidth
          value={formData.gardenCity}
          onChange={onTextChange("gardenCity")}
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Primary Project Category <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Select the category that BEST describes your project. This helps
          SeedMoney understand the types of gardens in the Challenge - it
          won&apos;t appear on your campaign page.
        </p>

        <p className="text-sm">Select one (Required):</p>

        <div className="flex flex-col gap-3">
          {categoryOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="gardenCategory"
                checked={formData.gardenCategory === option}
                onChange={() => setFieldValue("gardenCategory", option)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="text-sm group-hover:text-gray-900">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Beneficiary Populations Served{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Select up to 3 that BEST describe the primary communities your garden
          serves. This information helps SeedMoney report on the impact of the
          Challenge - it won&apos;t appear on your campaign page.
        </p>

        <p className="text-sm">Select up to three populations:</p>

        <div className="flex flex-col gap-3">
          {beneficiaryOptions.map((option) => {
            const isChecked = formData.gardenBeneficiaries.includes(option);
            const isDisabled =
              !isChecked &&
              formData.gardenBeneficiaries.length >=
                MAX_BENEFICIARY_SELECTIONS;
            return (
              <label
                key={option}
                className={`flex items-center gap-3 group ${
                  isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => onToggleBeneficiary(option)}
                  className="w-[18px] h-[18px] cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm group-hover:text-gray-900">
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
