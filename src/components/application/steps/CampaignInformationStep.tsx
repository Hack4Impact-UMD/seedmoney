"use client";

import TextField from "@mui/material/TextField";

export default function CampaignInformationStep() {
  return (
    <div className="flex flex-col gap-6 w-[700px]">

      {/* campaign title */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Campaign Title <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          This will be the public title of your fundraising campaign. Choose something clear and recognizable, e.g.
          Fairview Community Garden, Pleasantville Primary School Garden, Holy Jalapeno Church Garden, etc.
        </p>

        <TextField
          label="Campaign Title"
          variant="standard"
          helperText="60 max characters"
          fullWidth
        />
      </div>

      {/* project details & impact */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h2>

        <TextField
          label="About how many people will benefit from this garden this year?"
          variant="standard"
          fullWidth
        />

        <TextField
          label="Approximate garden size or scope"
          helperText="Examples: one raised bed, multiple sites, two-acre farm."
          variant="standard"
          fullWidth
        />

        <p className="text-sm pt-2">
          Is this a new or existing garden?
        </p>

        <div className="flex flex-col gap-3">

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="gardenType"
              className="
                w-6 h-6
                accent-blue-600
                cursor-pointer
              "
            />
            <span className="text-sm">
              New garden
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="gardenType"
              className="
                w-6 h-6
                accent-blue-600
                cursor-pointer
              "
            />
            <span className="text-sm ">
              Existing garden
            </span>
          </label>

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

        <TextField
          label="Fundraising Goal (USD)"
          variant="standard"
          fullWidth
        />
      </div>

      {/* buttons */}
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