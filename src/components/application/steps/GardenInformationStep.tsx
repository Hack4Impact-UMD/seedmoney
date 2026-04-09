"use client";

import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import { useState } from "react";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";

const categoryOptions = [
  "Community Garden",
  "School or Youth Garden",
  "Food Pantry or Food Bank Garden",
  "Urban Farm",
  "Refugee or Immigrant Garden",
  "Tribal or Indigenous Garden Project",
  "Shelter or Transitional Housing Garden",
  "Therapeutic or Healing Garden",
  "Job Training or Vocational Garden",
  "Demonstration or Education Garden",
  "Multi-Site Garden Program",
  "Other (please specify)",
];

const beneficiaryOptions = [
  "Children (ages 0–12)",
  "Youth / Adolescents (ages 13–18)",
  "Families",
  "Seniors / Older adults",
  "Low-income individuals or households",
  "Food-insecure individuals or households",
  "Immigrants and refugees",
  "Indigenous / Native communities",
  "People with disabilities",
  "Veterans and military families",
  "People experiencing homelessness or housing insecurity",
  "Unemployed or underemployed individuals",
  "Justice-involved individuals",
  "Rural communities",
  "Urban communities",
  "Other (please specify)",
];

export default function GardenInformationStep() {
  const form = useApplicationForm();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const [isOtherCategorySelected, setIsOtherCategorySelected] = useState(false);
  const [isOtherBeneficiarySelected, setIsOtherBeneficiarySelected] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-[700px] m-15">
      {/* Garden Location */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Garden Location <span className="text-orange-500">*</span>
        </h2>

        <form.Field name="gardenCity">
          {(field) => (
            <TextField
              label="City"
              variant="standard"
              fullWidth
              name="gardenCity"
              autoComplete="address-level2"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ city: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="gardenState">
          {(field) => (
            <TextField
              label="State / Province"
              variant="standard"
              fullWidth
              name="gardenState"
              autoComplete="address-level1"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ state: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="gardenCountry">
          {(field) => (
            <TextField
              label="Country"
              variant="standard"
              fullWidth
              name="gardenCountry"
              autoComplete="country-name"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ country: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Primary Project Category */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Primary Project Category <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select one:</p>


        <form.Field name="gardenCategory">
          {(field) => (
            <div className="flex flex-col gap-3">
              {categoryOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="gardenCategory"
                    checked={
                      option === "Other (please specify)"
                        ? isOtherCategorySelected
                        : field.state.value === option
                    }
                    onChange={() => {
                      if (option === "Other (please specify)") {
                        setIsOtherCategorySelected(true);
                        field.handleChange(""); // user will type value
                      } else {
                        setIsOtherCategorySelected(false);
                        field.handleChange(option);
                        void saveDraftCampaign({ project_category: option });
                      }
                    }}
                    className="w-[20px] h-[20px] accent-blue-600 cursor-pointer transition-transform duration-150 group-hover:scale-105"
                  />

                  <span className="text-sm group-hover:text-gray-900">
                    {option}
                  </span>
                </label>
              ))}

              {isOtherCategorySelected && (
                <input
                  type="text"
                  name="gardenCategoryOther"
                  placeholder="Please specify"
                  value={field.state.value}
                  onBlur={async (e) => {
                    await saveDraftCampaign({
                      project_category: e.target.value,
                    });
                  }}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onInput={(e) =>
                    field.handleChange((e.target as HTMLInputElement).value)
                  }
                  className="mt-2 p-2 border border-gray-300 rounded-md text-sm"
                />
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Beneficiary Populations Served */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Beneficiary Populations Served{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select all that apply:</p>

        <form.Field name="gardenBeneficiaries">
          {(field) => {
            const OTHER_OPTION = "Other (please specify)";

            return (
              <div className="flex flex-col gap-3">
                {beneficiaryOptions.map((option) => {
                  const isChecked =
                    option === OTHER_OPTION
                      ? isOtherBeneficiarySelected
                      : field.state.value.includes(option);

                  return (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (option === OTHER_OPTION) {
                            if (e.target.checked) {
                              setIsOtherBeneficiarySelected(true);
                            } else {
                              setIsOtherBeneficiarySelected(false);
                              const nextValue = field.state.value.filter((item) =>
                                beneficiaryOptions.includes(item),
                              );
                              field.handleChange(nextValue);
                              void saveDraftCampaign({
                                project_beneficiaries: nextValue,
                              });
                            }
                            return;
                          }

                          if (e.target.checked) {
                            const nextValue = [...field.state.value, option];
                            field.handleChange(nextValue);
                            void saveDraftCampaign({
                              project_beneficiaries: nextValue,
                            });
                            return;
                          }

                          const nextValue = field.state.value.filter(
                            (item) => item !== option,
                          );
                          field.handleChange(nextValue);
                          void saveDraftCampaign({
                            project_beneficiaries: nextValue,
                          });
                        }}
                        className="
                          w-[18px] h-[18px]
                          accent-blue-600
                          cursor-pointer
                          transition-transform
                          duration-150
                          group-hover:scale-105
                        "
                      />

                      <span className="text-sm group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  );
                })}

                {isOtherBeneficiarySelected && (
                  <input
                    type="text"
                    name="gardenBeneficiariesOther"
                    placeholder="Please specify"
                    value={
                      field.state.value.find(
                        (item) => !beneficiaryOptions.includes(item),
                      ) || ""
                    }
                    onChange={(e) => {
                      const customValue = e.target.value;
                      const withoutCustom = field.state.value.filter((item) =>
                        beneficiaryOptions.includes(item),
                      );

                      field.handleChange(
                        customValue
                          ? [...withoutCustom, customValue]
                          : withoutCustom,
                      );
                    }}
                    onBlur={async (e) => {
                      const customValue = e.target.value;
                      const withoutCustom = field.state.value.filter((item) =>
                        beneficiaryOptions.includes(item),
                      );
                      await saveDraftCampaign({
                        project_beneficiaries: customValue
                          ? [...withoutCustom, customValue]
                          : withoutCustom,
                      });
                    }}
                    className="mt-2 p-2 border border-gray-300 rounded-md text-sm"
                  />
                )}
              </div>
            );
          }}
        </form.Field>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          component={Link}
          href="/apply/campaign"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>
        <Button
          component={Link}
          href="/apply/story"
          variant="contained"
          size="medium"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
