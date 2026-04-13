"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertAnswerByCampaignAndQuestion } from "@/src/actions/db/answers";
import { Answers } from "@/src/types/db/answers";

export default function useUpsertAnswer() {
  const queryClient = useQueryClient();

  return useMutation<
    Answers,
    Error,
    { campaignId: number; questionId: number; finalAnswer: string }
  >({
    mutationFn: async ({ campaignId, questionId, finalAnswer }) => {
      const answer = await upsertAnswerByCampaignAndQuestion({
        campaignId,
        questionId,
        finalAnswer,
      });

      if (!answer) {
        throw new Error("Error saving answer");
      }

      return answer;
    },
    onSuccess: (_data, { campaignId, questionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["answers", campaignId, questionId],
      });
    },
  });
}
