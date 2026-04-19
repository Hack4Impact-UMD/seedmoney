"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgreementGate } from "@/src/components/application/ApplicationFormProvider";
import { GRANT_AGREEMENT_ITEMS } from "@/src/components/application/grantAgreementItems";
import BaseModal from "@/src/components/bases/BaseModal";

const checkboxStyle = {
  color: "#1976D2",
  "&.Mui-checked": {
    color: "#1976D2",
  },
};

export default function GrantAgreementStep() {
  const router = useRouter();
  const { hasPassedAgreement, setHasPassedAgreement } = useAgreementGate();
  const [agreementSelections, setAgreementSelections] = useState<boolean[]>(
    () =>
      GRANT_AGREEMENT_ITEMS.map((item) =>
        item.required ? hasPassedAgreement : false,
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
    setAgreementSelections((prev) =>
      prev.map((value, currentIndex) =>
        currentIndex === index ? !value : value,
      ),
    );
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

      <BaseModal
        open={isAiOptInModalOpen}
        onClose={() => setIsAiOptInModalOpen(false)}
        title="AI Editing Opt-In Statement"
        containerClassName="w-[612px] max-w-[calc(100vw-32px)] rounded-[6px] px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]"
        titleClassName="mb-5 text-[16px] font-semibold leading-8 text-[#123A1E]"
      >
        <button
          type="button"
          onClick={() => setIsAiOptInModalOpen(false)}
          className="absolute right-6 top-5 text-[#6B6B6B] transition-colors hover:text-[#123A1E]"
          aria-label="Close AI opt-in statement"
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col gap-6 text-[16px] leading-8 text-black">
          <p>
            If you opt in, any text from your application that is displayed on
            the publicly facing campaign page may be processed using GPT-5-mini
            for the purpose of light editing and polishing, such as grammar and
            clarity improvements, while preserving your original style, intent,
            and content. No substantive changes will be made.
          </p>

          <p>
            AI editing will only be applied if you explicitly opt in. By
            selecting this option, you consent to the use of AI in editing your
            campaign text and authorize SeedMoney the ability to review, accept,
            or deny any suggested edits on your behalf. Once edits introduced by
            GPT-5-mini are finalized and implemented, you will not have the
            ability to make further changes to your campaign page text.
          </p>

          <p>
            Please note that OpenAI may retain data and use submitted content in
            prompts for model training purposes, as outlined in their Terms of
            Use{" "}
            <a
              href="https://openai.com/policies/row-terms-of-use/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-[#123A1E]"
            >
              here
            </a>
            . You are responsible for ensuring that your submission does not
            include any sensitive information or personally identifiable
            information (PII). For guidance on what constitutes PII, reference{" "}
            <a
              href="https://www.dol.gov/general/ppii"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-[#123A1E]"
            >
              this definition
            </a>{" "}
            from the U.S. Department of Labor.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button
            variant="text"
            size="medium"
            className="!text-[16px] !font-medium !text-[#666666]"
            onClick={() => setIsAiOptInModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="medium"
            className="!px-5"
            onClick={handleAiOptIn}
          >
            Opt In
          </Button>
        </div>
      </BaseModal>
    </div>
  );
}
