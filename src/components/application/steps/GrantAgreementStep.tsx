"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { Button } from "@mui/material";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import { GRANT_AGREEMENT_ITEMS } from "@/src/components/application/grantAgreementItems";

const checkboxStyle = {
  color: "#1976D2",
  "&.Mui-checked": {
    color: "#1976D2",
  },
};

export default function GrantAgreementStep() {
  const {
    agreementSelections,
    setAgreementSelections,
    setCurrentStep,
    updateStepStatus,
  } = useApplicationForm();
  const allChecked = agreementSelections.every(Boolean);
  const allCheckedRef = useRef(allChecked);

  useEffect(() => {
    allCheckedRef.current = allChecked;
  }, [allChecked]);

  useEffect(() => {
    setCurrentStep("Grantee Agreement");

    return () => {
      updateStepStatus(
        "Grantee Agreement",
        allCheckedRef.current ? "completed" : "review",
      );
    };
  }, [setCurrentStep, updateStepStatus]);

  const toggle = (index: number) => {
    setAgreementSelections((prev) =>
      prev.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );
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
        <p className={`font-medium ${allChecked ? "text-black" : "text-red-500"}`}>
          I confirm that:
        </p>

        {GRANT_AGREEMENT_ITEMS.map((label, i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                sx={checkboxStyle}
                checked={agreementSelections[i]}
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
        <Button component={Link} href="/apply" variant="outlined" size="medium">
          Previous Step
        </Button>

        <Button
          component={Link}
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
