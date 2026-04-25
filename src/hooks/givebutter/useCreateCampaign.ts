// hooks/useCreateGivebutterCampaign.ts
import { useMutation } from "@tanstack/react-query";
import { createCampaign } from "@/src/actions/givebutter/campaignsGivebutter";
import { GivebutterCampaignPayload } from "@/src/types";

export function useCreateGivebutterCampaign() {
  return useMutation({
    mutationFn: (campaignData: Pick<GivebutterCampaignPayload, "title" | "goal" | "end_at" | "description" | "cover">) =>
      createCampaign(campaignData),
    onError: (error) => {
      console.error("Failed to create Givebutter campaign:", error);
    },
  });
}