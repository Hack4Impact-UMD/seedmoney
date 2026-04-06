import { useQuery } from "@tanstack/react-query";
import { readCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export default function useReadCampaign(campaignId: number) {

    return useQuery<Campaign | Campaign[]>({
        queryKey: [campaignId, 'campaign', 'read'],
        queryFn: async () =>  {
          const campaign = await readCampaign(campaignId);
          if (!campaign) throw new Error("Error reading campaign");
          return campaign;
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!campaignId
    });
}