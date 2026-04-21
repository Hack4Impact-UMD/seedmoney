import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setMainCampaignImage } from "@/src/actions/db/campaign-image-records";

export function useSetMainCampaignImage(campaignId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newMainId: number) => setMainCampaignImage(campaignId, newMainId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns"],
      });
    },
  });
}