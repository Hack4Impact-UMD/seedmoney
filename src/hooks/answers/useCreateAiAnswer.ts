"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAiAnswer } from "@/src/actions/db/answers";
import { Answers } from "@/src/types/db/answers";

export default function useCreateAiAnswer() {
  const queryClient = useQueryClient();

  return useMutation<
    Answers,
    Error,
    { campaignId: number; questionId: number; aiAnswer: string }
  >({
    mutationFn: async ({ campaignId, questionId, aiAnswer }) => {
      const answer = await createAiAnswer({
        campaignId,
        questionId,
        aiAnswer,
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
