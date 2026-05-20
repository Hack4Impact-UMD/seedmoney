"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";
import { applicationGardenCategories } from "@/src/constants/gardenCategories";
import { STATES, COUNTRIES } from "@/src/components/application/addressOptions";

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
  const router = useRouter();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const normalizeCountryValue = (value: string) => value.trim().toLowerCase();
  const isUsCountry = (value: string) => {
    const normalizedValue = normalizeCountryValue(value);
    return normalizedValue === "us" || normalizedValue === "united states";
  };
  const isUsGardenCountry = isUsCountry(form.state.values.gardenCountry);
  const [isOtherCategorySelected, setIsOtherCategorySelected] = useState(false);
  const [isOtherBeneficiarySelected, setIsOtherBeneficiarySelected] =
    useState(false);

  const gardenInformationRef = useRef({
    city: form.state.values.gardenCity,
    state: form.state.values.gardenState,
    country: form.state.values.gardenCountry,
    project_category: form.state.values.gardenCategory,
    project_beneficiaries: form.state.values.gardenBeneficiaries,
  });

  const saveGardenInformationDraft = async (
    overrides: Partial<typeof form.state.values> = {},
  ) => {
    const values = {
      ...form.state.values,
      ...overrides,
    };

    const currentPayload = {
      city: values.gardenCity,
      state: values.gardenState,
      country: values.gardenCountry,
      project_category: values.gardenCategory,
      project_beneficiaries: values.gardenBeneficiaries,
    };

    const changedValues: Partial<typeof currentPayload> = {};

    if (currentPayload.city !== gardenInformationRef.current.city) {
      changedValues.city = currentPayload.city;
    }

    if (currentPayload.state !== gardenInformationRef.current.state) {
      changedValues.state = currentPayload.state;
    }

    if (currentPayload.country !== gardenInformationRef.current.country) {
      changedValues.country = currentPayload.country;
    }

    if (
      currentPayload.project_category !==
      gardenInformationRef.current.project_category
    ) {
      changedValues.project_category = currentPayload.project_category;
    }

    if (
      JSON.stringify(currentPayload.project_beneficiaries) !==
      JSON.stringify(gardenInformationRef.current.project_beneficiaries)
    ) {
      changedValues.project_beneficiaries =
        currentPayload.project_beneficiaries;
    }

    if (Object.keys(changedValues).length === 0) {
      return;
    }

    await saveDraftCampaign(changedValues);

    gardenInformationRef.current = currentPayload;
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[640px] flex-col gap-5">
      {/* Garden Location */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Garden Location <span className="text-orange-500">*</span>
        </h2>
        <form.Field name="gardenCountry">
          {(field) => (
            <TextField
              select
              label="Country (Required)"
              variant="standard"
              fullWidth
              name="gardenCountry"
              autoComplete="new-password"
              value={field.state.value}
              onChange={async (e) => {
                const nextCountry = e.target.value;
                const shouldClearState =
                  normalizeCountryValue(field.state.value) !==
                  normalizeCountryValue(nextCountry);

                field.handleChange(nextCountry);

                if (shouldClearState) {
                  form.setFieldValue("gardenState", "");
                }

                await saveGardenInformationDraft({
                  gardenCountry: nextCountry,
                  ...(shouldClearState ? { gardenState: "" } : {}),
                });
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <span className="text-gray-400">
                        Country (Required)
                      </span>
                    );
                  }
                  return String(selected);
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>

              {field.state.value && !COUNTRIES.includes(field.state.value) && (
                <MenuItem value={field.state.value}>
                  {field.state.value}
                </MenuItem>
              )}

              {COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
          )}
        </form.Field>

        <form.Field name="gardenState">
          {(field) =>
            isUsGardenCountry ? (
              <TextField
                select
                label="State / Province (Required)"
                variant="standard"
                fullWidth
                name="gardenState"
                autoComplete="new-password"
                value={field.state.value}
                onChange={async (e) => {
                  field.handleChange(e.target.value);
                  await saveGardenInformationDraft({
                    gardenState: e.target.value,
                  });
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span className="text-gray-400">
                          State / Province (Required)
                        </span>
                      );
                    }
                    const selectedState = STATES.find(
                      (state) => state.code === selected,
                    );
                    return selectedState?.name ?? String(selected);
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                {field.state.value &&
                  !STATES.some((s) => s.code === field.state.value) && (
                    <MenuItem value={field.state.value}>
                      {field.state.value}
                    </MenuItem>
                  )}

                {STATES.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                variant="standard"
                label="State / Province (Required)"
                helperText="Write N/A if not applicable"
                fullWidth
                name="gardenState"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={async (e) => {
                  field.handleBlur();
                  await saveGardenInformationDraft({
                    gardenState: e.target.value,
                  });
                }}
                onChange={(e) => field.handleChange(e.target.value)}
                onInput={(e) =>
                  field.handleChange((e.target as HTMLInputElement).value)
                }
              />
            )
          }
        </form.Field>

        <form.Field name="gardenCity">
          {(field) => (
            <TextField
              label="City or Town (Required)"
              variant="standard"
              fullWidth
              name="gardenCity"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveGardenInformationDraft({
                  gardenCity: e.target.value,
                });
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
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Primary Project Category <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Select the category that BEST describes your project. This helps
          SeedMoney understand the types of gardens in the Challenge - it
          won&apos;t appear on your campaign page.
        </p>

        <p className="text-sm">Select one (Required):</p>

        <form.Field name="gardenCategory">
          {(field) => (
            <div className="flex flex-col gap-3">
              {applicationGardenCategories.map((option) => (
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
                        void saveGardenInformationDraft({
                          gardenCategory: option,
                        });
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
                  placeholder="Please specify (Required)"
                  value={field.state.value}
                  onBlur={async (e) => {
                    field.handleBlur();
                    await saveGardenInformationDraft({
                      gardenCategory: e.target.value,
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
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Beneficiary Populations Served{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Select up to 3 that BEST describe the primary communities your garden
          serves. This information helps SeedMoney report on the impact of the
          Challenge - it won&apos;t appear on your campaign page.
        </p>

        <p className="text-sm">Select up to three populations (Required):</p>

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
                              const nextValue = field.state.value.filter(
                                (item) => beneficiaryOptions.includes(item),
                              );
                              field.handleChange(nextValue);
                              void saveGardenInformationDraft({
                                gardenBeneficiaries: nextValue,
                              });
                            }
                            return;
                          }

                          if (e.target.checked) {
                            const nextValue = [...field.state.value, option];
                            field.handleChange(nextValue);
                            void saveGardenInformationDraft({
                              gardenBeneficiaries: nextValue,
                            });
                            return;
                          }

                          const nextValue = field.state.value.filter(
                            (item) => item !== option,
                          );
                          field.handleChange(nextValue);
                          void saveGardenInformationDraft({
                            gardenBeneficiaries: nextValue,
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
                    placeholder="Please specify (Required)"
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
                      field.handleBlur();
                      const customValue = e.target.value;
                      const withoutCustom = field.state.value.filter((item) =>
                        beneficiaryOptions.includes(item),
                      );
                      await saveGardenInformationDraft({
                        gardenBeneficiaries: customValue
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
      <div className="flex w-full flex-col-reverse gap-3 md:flex-row md:justify-between md:gap-0 pt-2">
        <Button
          component={Link}
          href="/apply/campaign"
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
            await saveGardenInformationDraft();
            router.push("/apply/story");
          }}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
