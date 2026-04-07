import { useQuery } from "@tanstack/react-query";
import { readQuestion } from "@/src/actions/db/questions";
import { Question } from "@/src/types/db/questions";

export default function useReadCampaign(questionId: number) {
  return useQuery<Question | Question[]>({
    queryKey: [questionId, "campaign", "read"],
    queryFn: async () => {
      const question = await readQuestion(questionId);
      if (!question) throw new Error("Error reading campaign");
      return question;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!questionId,
  });
}
