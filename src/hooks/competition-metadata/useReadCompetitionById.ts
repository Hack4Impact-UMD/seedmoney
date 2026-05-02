// src/hooks/competition-metadata/useReadCompetitionById.ts
import { useQuery } from "@tanstack/react-query";
import { readCompetitionById } from "@/src/actions/db/competition-metadata";

export default function useReadCompetitionById(competitionId: number | null | undefined) {
  return useQuery({
    queryKey: ["competition", competitionId],
    enabled: competitionId != null,
    queryFn: () => readCompetitionById(competitionId!),
  });
}