"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { Button } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AiOptInModal from "@/src/components/application/AiOptInModal";
import {
  useAgreementGate,
  useApplicationForm,
} from "@/src/components/application/ApplicationFormProvider";
import { GRANT_AGREEMENT_ITEMS } from "@/src/components/application/grantAgreementItems";

const checkboxStyle = {
  color: "#1976D2",
  "&.Mui-checked": {
    color: "#1976D2",
  },
};

export default function GrantAgreementStep() {
  const form = useApplicationForm();
  const router = useRouter();
  const { hasPassedAgreement, setHasPassedAgreement } = useAgreementGate();
  const [agreementSelections, setAgreementSelections] = useState<boolean[]>(
    () =>
      GRANT_AGREEMENT_ITEMS.map((item) =>
        item.required ? hasPassedAgreement : form.state.values.aiOptIn,
      ),
  );
  const [isAiOptInModalOpen, setIsAiOptInModalOpen] = useState(false);
  const aiOptInItemIndex = GRANT_AGREEMENT_ITEMS.findIndex(
    (item) => item.kind === "aiOptIn",
  );
  const allChecked = GRANT_AGREEMENT_ITEMS.every(
    (item, index) => !item.required || agreementSelections[index],
  );

  const toggle = (index: number) => {
    const nextValue = !agreementSelections[index];

    setAgreementSelections((prev) =>
      prev.map((value, currentIndex) =>
        currentIndex === index ? nextValue : value,
      ),
    );

    if (index === aiOptInItemIndex) {
      form.setFieldValue("aiOptIn", nextValue);
    }
  };

  const handleNext = () => {
    if (!allChecked) {
      return;
    }

    setHasPassedAgreement(true);
    router.push("/apply/campaign");
  };

  const handleAiOptIn = () => {
    if (aiOptInItemIndex !== -1) {
      setAgreementSelections((prev) =>
        prev.map((value, index) => (index === aiOptInItemIndex ? true : value)),
      );
      form.setFieldValue("aiOptIn", true);
    }

    setIsAiOptInModalOpen(false);
  };

  const renderAgreementLabel = (item: (typeof GRANT_AGREEMENT_ITEMS)[number]) => {
    if (item.kind !== "aiOptIn") {
      return item.text;
    }

    const [beforeOptInLink, afterOptInLink] = item.text.split("opt-in statement");

    return (
      <span>
        {beforeOptInLink}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsAiOptInModalOpen(true);
          }}
          className="cursor-pointer underline underline-offset-2 hover:text-[#123A1E]"
        >
          opt-in statement
        </button>
        {afterOptInLink}
      </span>
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

        {GRANT_AGREEMENT_ITEMS.map((item, i) => (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                sx={checkboxStyle}
                checked={agreementSelections[i]}
                onChange={() => toggle(i)}
              />
            }
            label={renderAgreementLabel(item)}
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
          onClick={handleNext}
          variant={allChecked ? "contained" : "text"}
          className={allChecked ? "!px-4" : "!bg-[#E0E0E0] !px-4"}
          size="medium"
          disabled={!allChecked}
        >
          Next Step
        </Button>
      </div>

      <AiOptInModal
        open={isAiOptInModalOpen}
        onClose={() => setIsAiOptInModalOpen(false)}
        onOptIn={handleAiOptIn}
      />
    </div>
  );
}
