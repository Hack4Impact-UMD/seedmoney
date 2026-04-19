import { useQuery } from "@tanstack/react-query";
import { readCampaignImageUrlsByCampaignIds } from "@/src/actions/db/campaign-image-records";

export default function useReadCampaignImageUrlsByCampaignIds(
  campaignIds: number[],
) {
  const sortedCampaignIds = [...campaignIds].sort((left, right) => left - right);

  return useQuery<Record<number, string | null>>({
    queryKey: ["campaign-images", "read-urls-by-campaign-ids", sortedCampaignIds],
    queryFn: async () => {
      if (sortedCampaignIds.length === 0) {
        return {};
      }

      return await readCampaignImageUrlsByCampaignIds(sortedCampaignIds);
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: sortedCampaignIds.length > 0,
  });
}
