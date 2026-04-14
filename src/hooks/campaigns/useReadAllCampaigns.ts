import { useQuery } from "@tanstack/react-query";
import { readCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export default function useReadAllCampaigns(options?: { enabled?: boolean }) {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "all"],
    queryFn: async () => {
      const result = await readCampaign();
      if (!result) throw new Error("Error reading campaigns");
      return result as Campaign[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: options?.enabled ?? true,
  });
}
