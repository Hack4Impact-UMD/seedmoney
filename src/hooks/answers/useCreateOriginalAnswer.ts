"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOriginalAnswer } from "@/src/actions/db/answers";
import { Answers } from "@/src/types/db/answers";

export default function useCreateOriginalAnswer() {
  const queryClient = useQueryClient();

  return useMutation<
    Answers,
    Error,
    { campaignId: number; questionId: number; originalAnswer: string }
  >({
    mutationFn: async ({ campaignId, questionId, originalAnswer }) => {
      const answer = await createOriginalAnswer({
        campaignId,
        questionId,
        originalAnswer,
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
