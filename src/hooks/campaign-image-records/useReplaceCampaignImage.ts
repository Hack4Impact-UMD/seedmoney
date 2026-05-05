import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replaceCampaignImage } from "@/src/actions/db/campaign-image-records";
import type { CampaignImageRecord } from "@/src/types/db/campaignImageRecords";

export default function useReplaceCampaignImage() {
  const queryClient = useQueryClient();

  return useMutation<
    CampaignImageRecord,
    Error,
    { file: File; campaignId: number; oldStoragePath: string }
  >({
    mutationFn: ({ file, campaignId, oldStoragePath }) =>
      replaceCampaignImage({
        file,
        campaignId,
        oldStoragePath,
      }),
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign-images", campaignId],
      });
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [namespace, operation, campaignIds] = query.queryKey;

          return (
            namespace === "campaign-images" &&
            operation === "read-urls-by-campaign-ids" &&
            Array.isArray(campaignIds) &&
            campaignIds.includes(campaignId)
          );
        },
      });
    },
  });
}
