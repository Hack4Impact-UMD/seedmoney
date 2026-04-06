import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export default function useUpdateCampaign() {
    const queryClient = useQueryClient();

    return useMutation<Campaign, Error, { campaignId: number, campaignData: Partial<Campaign> }>({
        mutationFn: async ({ campaignId, campaignData }) => {
          const campaign = await updateCampaign(campaignId, campaignData);
          if (!campaign) throw new Error("Error updating campaign");
          return campaign;
        },
        onSuccess: (data, { campaignId }) => {
          // invalidate so useReadCampaign refetches fresh data
          queryClient.invalidateQueries({ queryKey: [campaignId, 'campaign', 'update'] });
        }
    });
}