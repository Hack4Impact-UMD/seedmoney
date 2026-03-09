"use client";

import { Checkbox, FormControlLabel } from "@mui/material";

const checkboxStyle = {
    color: "#1976D2",
    "&.Mui-checked": {
      color: "#1976D2",
    },
};

export default function GrantAgreementStep() {
  return (
    <div className="flex flex-col items-center pt-12">

      {/* CARD */}
      <div className="w-[700px] bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-4">

        {/* TITLE */}
        <h5 className="text-[20px] font-medium">
          Grantee Agreement <span className="text-red-500">*</span>
        </h5>

        {/* DESCRIPTION */}
        <p className="text-[14px]">
          By checking all boxes below and continuing, you are agreeing to the
          SeedMoney Challenge Grantee Agreement
        </p>

        {/* SECTION HEADER */}
        <p className="text-red-500 font-medium">
          I confirm that:
        </p>

        {/* CHECKBOXES */}
        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I am not seeking to raise funds for personal use or a personal garden. Funds must benefit a nonprofit or community-serving garden project.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I am applying on behalf of a nonprofit or community-based organization that can document its nonprofit or public-service status.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I understand SeedMoney cannot send funds to personal accounts or via informal transfer services.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I understand international projects must raise at least $50 to be eligible for electronic transfers.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I understand SeedMoney may request a brief progress report if my project receives funding.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I authorize SeedMoney to reuse submitted text and photos for educational or promotional purposes.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="I certify that the information provided is accurate and complete.*"
        />

        <FormControlLabel
          control={<Checkbox sx={checkboxStyle}/>}
          label="PLACEHOLDER FOR THE AI POLICY"
        />

        {/* ERROR */}
        <p className="text-red-500 text-sm">
          Please agree to all required terms before continuing.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="w-[700px] flex justify-between mt-6">

        <button
          className="border border-[#2D7A45] text-[#2D7A45] px-6 py-2 rounded-md font-medium hover:bg-[#EAF5EC] transition"
        >
          PREVIOUS STEP
        </button>

        <button
          disabled
          className="bg-gray-200 text-gray-400 px-6 py-2 rounded-md font-medium cursor-not-allowed"
        >
          NEXT STEP
        </button>

      </div>

    </div>
  );
}