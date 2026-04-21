"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { EditCampaignFormData, SetFieldValue, TextChangeHandler } from "@/src/types/frontend/campaignEdit";

interface GardenInformationSectionProps {
  formData: EditCampaignFormData;
  categoryOptions: string[];
  beneficiaryOptions: string[];
  onTextChange: TextChangeHandler;
  setFieldValue: SetFieldValue;
  onToggleBeneficiary: (option: string) => void;
}

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
          label="City"
          variant="standard"
          fullWidth
          value={formData.gardenCity}
          onChange={onTextChange("gardenCity")}
        />

 
        <TextField
          label="State / Province"
          variant="standard"
          fullWidth
          value={formData.gardenState}
          onChange={onTextChange("gardenState")}
        />



        <TextField
          label="Country"
          variant="standard"
          fullWidth
          value={formData.gardenCountry}
          onChange={onTextChange("gardenCountry")}
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Primary Project Category <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select one:</p>

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
              <span className="text-sm group-hover:text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Beneficiary Populations Served{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select all that apply:</p>

        <div className="flex flex-col gap-3">
          {beneficiaryOptions.map((option) => {
            const isChecked = formData.gardenBeneficiaries.includes(option);
            return (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleBeneficiary(option)}
                  className="w-[18px] h-[18px] cursor-pointer"
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
