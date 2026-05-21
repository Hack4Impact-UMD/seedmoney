import { useQuery } from "@tanstack/react-query";
import { readAllCompetitions } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useReadAllCompetitions(options?: { enabled?: boolean }) {
  return useQuery<CompetitionMetadata[]>({
    queryKey: ["competitions", "all"],
    queryFn: async () => {
      const competitions = await readAllCompetitions();
      if (!competitions) throw new Error("Error reading competitions");
      return competitions;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: options?.enabled ?? true,
  });
}
