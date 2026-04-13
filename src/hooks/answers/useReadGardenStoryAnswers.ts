import { useQuery } from "@tanstack/react-query";
import { readAnswersByCampaignId, AnswerWithQuestion } from "@/src/actions/db/answers";

export default function useReadGardenStoryAnswers(campaignId: number | null) {
    return useQuery<AnswerWithQuestion[]>({
        queryKey: [campaignId, 'answers', 'read'],
        queryFn: async () =>  {
          if (campaignId === null) return [];
          const answers = await readAnswersByCampaignId(campaignId);
          return answers;
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!campaignId
    });
}
