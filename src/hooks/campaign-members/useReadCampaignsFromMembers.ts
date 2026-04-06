import { useQuery } from "@tanstack/react-query";
import { readCampaignsFromMembers } from "@/src/actions/db/campaign-members";
import { Campaign } from "@/src/types/db/campaigns";

export default function useReadCampaignsFromMembers(userId: string) {

    return useQuery<Campaign[]>({
        queryKey: [userId, 'campaigns'],
        queryFn: async () => {
          const campaigns = await readCampaignsFromMembers(userId);
          if (!campaigns) return [];
          return campaigns as Campaign[];
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!userId
    });
}