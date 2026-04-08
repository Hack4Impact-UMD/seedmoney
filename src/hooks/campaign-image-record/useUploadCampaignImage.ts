import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCampaignImage } from "@/src/actions/db/campaign-image-records";
import {
  CampaignImageRecord,
  CampaignFile,
} from "@/src/types/db/campaignImageRecords";

export default function useUploadCampaignImage() {
  const queryClient = useQueryClient();

  return useMutation<CampaignImageRecord, Error, CampaignFile>({
    mutationFn: async ({
      file,
      campaignId,
      displayOrder,
      isMain = false,
    }: CampaignFile) => {
      const campaignImage = await uploadCampaignImage({
        file,
        campaignId,
        displayOrder,
        isMain,
      });

      if (!campaignImage) {
        throw new Error("Error uploading campaign image");
      }

      return campaignImage;
    },
    onSuccess: (_data, { campaignId }) => {
      //might need to fix later depending on if we want to fetch pics individually vs by group.
      queryClient.invalidateQueries({
        queryKey: ["campaign-images", campaignId],
      });
    },
  });
}
