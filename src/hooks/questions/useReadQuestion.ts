import { useQuery } from "@tanstack/react-query";
import { readQuestion } from "@/src/actions/db/questions";
import { Question } from "@/src/types/db/questions";

export default function useReadQuestion(questionId: number) {
  return useQuery<Question>({
    queryKey: [questionId, "question"],
    queryFn: async () => {
      const question = await readQuestion(questionId);
      if (!question) throw new Error("Error reading question");
      return question;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!questionId,
  });
}
