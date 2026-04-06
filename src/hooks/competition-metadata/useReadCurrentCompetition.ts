import { useQuery } from "@tanstack/react-query";
import { readCurrentCompetition } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useReadCurrentCompetition() {

    return useQuery<CompetitionMetadata>({
        queryKey: ['current-competition'],
        queryFn: async () => {
          const competition = await readCurrentCompetition();
          console.log("current competition", competition);
          if (!competition) throw new Error("Error reading campaign");
          return competition as CompetitionMetadata
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}