"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCampaignImage } from "@/src/actions/db/campaign-image-records";
import { DeleteCampaignFile } from "@/src/types/db/campaignImageRecords";

export default function useDeleteCampaignImage() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, DeleteCampaignFile>({
    mutationFn: async ({ storagePath }: DeleteCampaignFile) => {
      const deleted = await deleteCampaignImage(storagePath);

      if (!deleted) {
        throw new Error("Error deleting campaign image");
      }

      return deleted;
    },
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign-images", campaignId],
      });
    },
  });
}
