import { useQuery } from "@tanstack/react-query";
import { readCurrentCompetition } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useReadCurrentCompetition() {

    return useQuery<CompetitionMetadata | null>({
        queryKey: ['current-competition'],
        queryFn: async () => {
          const competition = await readCurrentCompetition();
          return competition ?? null;
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}