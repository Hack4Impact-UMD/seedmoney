"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";

export type CreateCampaignInput = Partial<
  Omit<
  Campaign,
  "campaign_id" | "givebutterlink" | "givebutter_id" | "givebutter_slug"
  >
> & {
  givebutterlink?: string | undefined;
  givebutter_id?: string | undefined;
  givebutter_slug?: string | undefined;
};

export default function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      campaignData: CreateCampaignInput,
    ): Promise<Campaign> => {
      const campaign = await createCampaign(campaignData);

      if (!campaign) {
        throw new Error("Error creating campaign");
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
