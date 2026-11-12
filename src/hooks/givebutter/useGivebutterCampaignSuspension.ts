import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  republishSuspendedGivebutterCampaign,
  unpublishGivebutterCampaign,
} from "@/src/actions/givebutter/campaignsGivebutter";

export default function useGivebutterCampaignSuspension() {
  const queryClient = useQueryClient();

  const invalidateCampaignQueries = async (campaignId: number) => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [{ campaignId }, "campaigns", "read"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "approved-campaigns"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "previous-campaigns"],
      }),
    ]);
  };

  const suspend = useMutation({
    mutationFn: (campaignId: number) =>
      unpublishGivebutterCampaign(campaignId),
    onSettled: (_result, _error, campaignId) =>
      invalidateCampaignQueries(campaignId),
  });

  const unsuspend = useMutation({
    mutationFn: (campaignId: number) =>
      republishSuspendedGivebutterCampaign(campaignId),
    onSettled: (_result, _error, campaignId) =>
      invalidateCampaignQueries(campaignId),
  });

  return { suspend, unsuspend };
}
