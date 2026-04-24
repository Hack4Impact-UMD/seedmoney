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
