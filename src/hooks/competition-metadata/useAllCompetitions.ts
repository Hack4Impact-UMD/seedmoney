import { useQuery } from "@tanstack/react-query";
import { readAllCompetitions } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useAllCompetitions() {
  return useQuery<CompetitionMetadata[]>({
    queryKey: ["all-competitions"],
    queryFn: async () => {
      const competitions = await readAllCompetitions();
      if (!competitions) return [];
      return competitions;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
