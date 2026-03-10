"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { Button } from "@mui/material";
import { useState } from "react";

const checkboxStyle = {
  color: "#1976D2",
  "&.Mui-checked": {
    color: "#1976D2",
  },
};

const items = [
  "I am not seeking to raise funds for personal use or a personal garden. Funds must benefit a nonprofit or community-serving garden project.*",
  "I am applying on behalf of a nonprofit or community-based organization that can document its nonprofit or public-service status.*",
  "I understand SeedMoney cannot send funds to personal accounts or via informal transfer services.*",
  "I understand international projects must raise at least $50 to be eligible for electronic transfers.*",
  "I understand SeedMoney may request a brief progress report if my project receives funding.*",
  "I authorize SeedMoney to reuse submitted text and photos for educational or promotional purposes.*",
  "I certify that the information provided is accurate and complete.*",
  "PLACEHOLDER FOR THE AI POLICY",
];

export default function GrantAgreementStep() {
  const [checked, setChecked] = useState<boolean[]>(() =>
    items.map(() => false),
  );

  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="flex flex-col items-center m-15">
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
        <p className="text-red-500 font-medium">I confirm that:</p>

        {items.map((label, i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                sx={checkboxStyle}
                checked={checked[i]}
                onChange={() => toggle(i)}
              />
            }
            label={label}
          />
        ))}

        {/** error message **/}
        <p
          className={`text-red-500 text-sm ${allChecked ? "invisible" : "visible"}`}
        >
          Please agree to all required terms before continuing.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="w-[700px] flex justify-between mt-6">
        <Button href="/apply" variant="outlined" size="medium">
          Previous Step
        </Button>

        <Button
          href="/apply/campaign"
          variant={allChecked ? "contained" : "text"}
          className={allChecked ? "!px-4" : "!bg-[#E0E0E0] !px-4"}
          size="medium"
          disabled={!allChecked}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
