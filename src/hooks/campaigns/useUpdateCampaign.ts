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
        onSuccess: (_data, { campaignId }) => {
          queryClient.invalidateQueries({
            predicate: (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey.some((part) => part === "campaigns"),
          });
          queryClient.invalidateQueries({
            queryKey: ["campaign-images", campaignId],
          });
        }
    });
}
