"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAIAnswer } from "@/src/actions/db/ai-polish";
import { Answers } from "@/src/types/db/answers";

export default function useCreateAiAnswer() {
  const queryClient = useQueryClient();

  return useMutation<
    Answers,
    Error,
    { campaignId: number; questionId: number; originalText: string }
  >({
    mutationFn: async ({ campaignId, questionId, originalText }) => {
      const answer = await createAIAnswer({
        campaignId,
        questionId,
        originalText,
      });

      if (!answer) {
        throw new Error("Error saving answer");
      }

      return answer;
    },
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey.some((part) => part === "answers") &&
          query.queryKey.some((part) => part === campaignId),
      });

      queryClient.invalidateQueries({
        queryKey: ["campaigns", "read", campaignId],
      });
    },
  });
}
