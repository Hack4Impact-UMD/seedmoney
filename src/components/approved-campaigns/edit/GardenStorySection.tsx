"use client";

import {TextField} from "@mui/material";
import {EditCampaignFormData, TextChangeHandler,} from "@/src/types/frontend/campaignEdit";

interface StoryComparisonBlockProps {
  question: string;
  originalValue: string;
  aiValue: string;
  finalValue: string;
  onFinalChange: ReturnType<TextChangeHandler>;
}

function StoryComparisonBlock({
  question,
  originalValue,
  aiValue,
  finalValue,
  onFinalChange,
}: StoryComparisonBlockProps) {
  return (
    <>
        <div className="mt-12 first:mt-0 col-span-1 lg:col-span-2">
        <h2 className="font-bold">{question}</h2>
      </div>

      <div className="mt-1 w-fit rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide">
        Original Version
      </div>
      <div className="w-full">
        <TextField
          variant="standard"
          placeholder="No original version available"
          fullWidth
          multiline
          value={originalValue}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </div>

      <div className="mt-1 w-fit rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide">
        AI Polished Version
      </div>
      <div className="w-full">
        <TextField
          variant="standard"
          placeholder="AI version will appear here"
          fullWidth
          multiline
          value={aiValue}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </div>

      <div className="mt-1 w-fit rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide">
        Final Version
      </div>
      <div className="w-full">
        <TextField
          variant="standard"
          placeholder="No final version available"
          fullWidth
          multiline
          value={finalValue}
          onChange={onFinalChange}
        />
      </div>
    </>
  );
}

interface GardenStorySectionProps {
  formData: EditCampaignFormData;
  onTextChange: TextChangeHandler;
  questions?: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
}

export default function GardenStorySection({
  formData,
  onTextChange,
  questions,
}: GardenStorySectionProps) {
  const hasMissingOriginalAnswer = [
    formData.storyLocationAndAudience,
    formData.storyChallengeOriginal,
    formData.storySeasonActivityOriginal,
    formData.storyCampaignImpactOriginal,
  ].some((answer) => answer.trim() === "");

  return (
    <>
      <h1 className="text-2xl font-bold">Garden Story</h1>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Garden Story <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm">2-3 sentences each</p>

        {hasMissingOriginalAnswer && (
          <div
            role="alert"
            className="rounded-md bg-[#FDECEA] px-4 py-3 text-sm text-[#5F2120]"
          >
            One or more applicant Garden Story answers are missing. Empty
            fields do not contain submitted applicant text.
          </div>
        )}

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[max-content_1fr] items-start gap-x-8 gap-y-4">
          {questions?.q1 && (
            <StoryComparisonBlock
              question={questions.q1}
              originalValue={formData.storyLocationAndAudience}
              aiValue={formData.storyLocationAndAudienceAI}
              finalValue={formData.storyLocationAndAudienceFinal}
              onFinalChange={onTextChange("storyLocationAndAudienceFinal")}
            />
          )}

          {questions?.q2 && (
            <StoryComparisonBlock
              question={questions.q2}
              originalValue={formData.storyChallengeOriginal}
              aiValue={formData.storyChallengeAI}
              finalValue={formData.storyChallengeFinal}
              onFinalChange={onTextChange("storyChallengeFinal")}
            />
          )}

          {questions?.q3 && (
            <StoryComparisonBlock
              question={questions.q3}
              originalValue={formData.storySeasonActivityOriginal}
              aiValue={formData.storySeasonActivityAI}
              finalValue={formData.storySeasonActivityFinal}
              onFinalChange={onTextChange("storySeasonActivityFinal")}
            />
          )}

          {questions?.q4 && (
            <StoryComparisonBlock
              question={questions.q4}
              originalValue={formData.storyCampaignImpactOriginal}
              aiValue={formData.storyCampaignImpactAI}
              finalValue={formData.storyCampaignImpactFinal}
              onFinalChange={onTextChange("storyCampaignImpactFinal")}
            />
          )}
        </div>
      </div>
    </>
  );
}
