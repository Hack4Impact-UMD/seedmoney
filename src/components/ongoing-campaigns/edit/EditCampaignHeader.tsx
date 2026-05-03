"use client";

import { ArrowBack } from "@mui/icons-material";

interface EditCampaignHeaderProps {
  text: string;
  onBack: () => void;
  tag?: { label: string; color: string; borderColor: string };
}

export default function EditCampaignHeader({
  text,
  onBack,
  tag,
}: EditCampaignHeaderProps) {
  return (
    <div className="flex flex-col-reverse md:flex-col mb-5">
      <h3 className="text-4xl font-bold text-[#096B2E]">
        {text}
      </h3>
      <div className="flex w-full items-center justify-between md:mt-0 mb-5 md:mb-0">
        <button
          onClick={onBack}
          className="flex w-fit cursor-pointer items-center uppercase !text-[#666666] text-sm font-bold transition hover:text-gray-800"
        >
          <ArrowBack className="mr-1 !text-sm" fontSize="inherit" />
          Back
        </button>
        {tag && (
          <span 
            className="md:hidden rounded-[20px] px-3 py-1 text-[13px] font-medium border bg-white"
            style={{ color: tag.color, borderColor: tag.borderColor }}
          >
            {tag.label}
          </span>
        )}
      </div>
    </div>
  );
}
