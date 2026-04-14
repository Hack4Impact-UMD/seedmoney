import { useQuery } from "@tanstack/react-query";
import { readAllCompetitions } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useReadAllCompetitions(options?: { enabled?: boolean }) {
  return useQuery<CompetitionMetadata[]>({
    queryKey: ["competitions", "all"],
    queryFn: readAllCompetitions,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: options?.enabled ?? true,
  });
}
