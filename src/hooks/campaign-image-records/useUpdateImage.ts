import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCampaignImageRecord } from "@/src/actions/db/campaign-image-records";
import type { CampaignImageRecord } from "@/src/types/db/campaignImageRecords";

export function useUpdateCampaignImageRecord(campaignId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Pick<CampaignImageRecord, "is_main" | "display_order">>;
    }) => updateCampaignImageRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns"],
      });
    },
  });
}