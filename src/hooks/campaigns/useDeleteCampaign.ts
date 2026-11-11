import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCampaignAndGivebutter } from "@/src/actions/givebutter/campaignsGivebutter";

export default function useDeleteCampaign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (campaignId: number) => deleteCampaignAndGivebutter(campaignId),
        onSuccess: () => {
          queryClient.invalidateQueries({
            predicate: (query) =>
              Array.isArray(query.queryKey) &&
              query.queryKey.some((part) => part === "campaigns"),
          });
        }
    });
}
