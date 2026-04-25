// hooks/useCreateGivebutterCampaign.ts
import { useMutation } from "@tanstack/react-query";
import { createGivebutterCampaigns } from "@/src/actions/givebutter/campaignsGivebutter";
import { GivebutterCampaignPayload } from "@/src/types";

export function useCreateGivebutterCampaign() {
  return useMutation({
    mutationFn: (campaignIds: number[]) =>
      createGivebutterCampaigns(campaignIds),
    onError: (error) => {
      console.error("Failed to create Givebutter campaigns:", error);
    },
  });
}