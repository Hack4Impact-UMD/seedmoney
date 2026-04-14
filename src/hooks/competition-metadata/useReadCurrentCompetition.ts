import { useQuery } from "@tanstack/react-query";
import { readCurrentCompetition } from "@/src/actions/db/competition-metadata";
import { CompetitionMetadata } from "@/src/types/db/competitionMetadata";

export default function useReadCurrentCompetition(options?: { enabled?: boolean }) {

    return useQuery<CompetitionMetadata | null>({
        queryKey: ['current-competition'],
        queryFn: readCurrentCompetition,
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: options?.enabled ?? true,
    });
}