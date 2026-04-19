"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import BaseModal from "@/src/components/bases/BaseModal";

type AiOptInModalProps = {
  open: boolean;
  onClose: () => void;
  onOptIn: () => void;
};

export default function AiOptInModal({
  open,
  onClose,
  onOptIn,
}: AiOptInModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="AI Editing Opt-In Statement"
      containerClassName="w-[612px] max-w-[calc(100vw-32px)] rounded-[6px] px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.2)]"
      titleClassName="mb-5 text-[16px] font-semibold leading-8 text-[#123A1E]"
    >
      <button
        type="button"
        onClick={onClose}
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
          prompts for model training purposes, as outlined in their Terms of Use{" "}
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
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button variant="contained" size="medium" className="!px-5" onClick={onOptIn}>
          Opt In
        </Button>
      </div>
    </BaseModal>
  );
}
