"use client";

import TextField from "@mui/material/TextField";

export default function GardenInformationStep() {
  return (
    <div className="flex flex-col gap-6 w-[700px]">

      {/* Garden Location */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Garden Location <span className="text-orange-500">*</span>
        </h2>

        <TextField
          label="City"
          variant="standard"
          fullWidth
        />

        <TextField
          label="State / Province"
          variant="standard"
          fullWidth
        />

        <TextField
          label="Country"
          variant="standard"
          defaultValue="United States"
          fullWidth
        />
      </div>


      {/* Primary Project Category */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Primary Project Category <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select one:</p>

        <div className="flex flex-col gap-3">

          {[
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
          ].map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                className="
                  w-[20px] h-[20px]
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
          ))}

        </div>
      </div>


      {/* Beneficiary Populations Served */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Beneficiary Populations Served <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm">Select all that apply:</p>

        <div className="flex flex-col gap-3">

          {[
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
          ].map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
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
          ))}

        </div>
      </div>


      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">

        <button
          className="
            border border-green-700
            text-green-700
            px-6 py-2
            min-w-[140px]
            rounded-md
            font-medium
            transition
            hover:bg-green-50
          "
        >
          PREVIOUS STEP
        </button>

        <button
          className="
            bg-green-700
            text-white
            px-6 py-2
            min-w-[140px]
            rounded-md
            font-medium
            transition
            hover:bg-green-800
          "
        >
          NEXT STEP
        </button>

      </div>

    </div>
  );
}