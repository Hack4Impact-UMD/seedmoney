import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompetition } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useUpdateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      competitionId,
      updates,
    }: {
      competitionId: number;
      updates: Partial<CompetitionMetadata>;
    }) => updateCompetition(competitionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-competition"] });
    },
  });
}