import { useQuery } from "@tanstack/react-query";
import { readCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export default function useReadCampaigns(params?: { campaignId?: number | number[] } ) {

    return useQuery<Campaign[]>({
        queryKey: [params, 'campaigns', 'read'],
        queryFn: async () =>  {
          const data = await readCampaign(params?.campaignId);
          if (!data) return [];
          return Array.isArray(data) ? data : [data];
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!params?.campaignId
    });
}
