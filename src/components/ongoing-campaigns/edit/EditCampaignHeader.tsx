"use client";

import { ArrowBack } from "@mui/icons-material";

interface EditCampaignHeaderProps {
  text: string;
  onBack: () => void;
}

export default function EditCampaignHeader({
  text,
  onBack,
}: EditCampaignHeaderProps) {
  return (
    <>
      <h3 className="mb-5 text-4xl font-bold text-[#096B2E]">
        {text}
      </h3>
      <button
        onClick={onBack}
        className="flex w-fit cursor-pointer items-center uppercase !text-[#666666] text-sm font-bold transition hover:text-gray-800"
      >
        <ArrowBack className="mr-1 !text-sm" fontSize="inherit" />
        Back
      </button>
    </>
  );
}
