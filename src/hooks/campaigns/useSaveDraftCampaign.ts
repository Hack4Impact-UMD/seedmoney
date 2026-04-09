"use client";

import { Campaign } from "@/src/types/db/campaigns";
import {
  useDraftCampaignId,
  useLastSaved,
} from "@/src/components/application/ApplicationFormProvider";
import useCreateCampaign from "@/src/hooks/campaigns/useCreateCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";

export default function useSaveDraftCampaign() {
  const { draftCampaignId, setDraftCampaignId } = useDraftCampaignId();
  const { setLastSaved } = useLastSaved();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const saveDraftCampaign = async (campaignData: Partial<Campaign>) => {
    if (!draftCampaignId) {
      const draftCampaign = await createCampaign.mutateAsync({
        status: "in_progress",
        date_created: new Date().toISOString(),
        ...campaignData,
      });

      setDraftCampaignId(draftCampaign.campaign_id);
      setLastSaved(new Date().toLocaleTimeString());
      return draftCampaign.campaign_id;
    }

    await updateCampaign.mutateAsync({
      campaignId: draftCampaignId,
      campaignData,
    });
    setLastSaved(new Date().toLocaleTimeString());
    return draftCampaignId;
  };

  return {
    draftCampaignId,
    saveDraftCampaign,
    isCreatingDraft: createCampaign.isPending,
    isUpdatingDraft: updateCampaign.isPending,
  };
}
