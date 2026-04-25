"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateAIAnswersMutationInput = {
  campaignId: number;
  overwrite?: boolean;
  questions: {
    questionId: number;
    questionText: string;
    originalText: string;
  }[];
};

export default function useCreateAIAnswers() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateAIAnswersMutationInput>({
    mutationFn: async ({ campaignId, overwrite, questions }) => {
      const response = await fetch("/api/ai-polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          campaignId,
          overwrite,
          questions,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(errorBody?.error ?? "Failed to create AI answers");
      }
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
