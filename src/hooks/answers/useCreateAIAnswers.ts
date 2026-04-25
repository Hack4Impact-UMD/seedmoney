"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAIAnswers } from "@/src/actions/db/ai-polish";
import { Answers } from "@/src/types/db/answers";

type CreateAIAnswersMutationInput = {
  campaignId: number;
  questions: {
    questionId: number;
    questionText: string;
    originalText: string;
  }[];
};

export default function useCreateAIAnswers() {
  const queryClient = useQueryClient();

  return useMutation<Answers[], Error, CreateAIAnswersMutationInput>({
    mutationFn: async ({ campaignId, questions }) => {
      return createAIAnswers({
        campaignId,
        questions,
      });
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
