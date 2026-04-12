"use client";

import { Campaign } from "@/src/types/db/campaigns";
import {
  useDraftCampaignId,
  useLastSaved,
} from "@/src/components/application/ApplicationFormProvider";
import useCreateCampaign from "@/src/hooks/campaigns/useCreateCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";

function getFormattedSaveTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function useSaveDraftCampaign() {
  const { draftCampaignId, setDraftCampaignId } = useDraftCampaignId();
  const { setLastSaved } = useLastSaved();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const saveDraftCampaign = async (campaignData: Partial<Campaign>) => {
    campaignData = Object.fromEntries(
      Object.entries(campaignData).filter(([, value]) => value !== undefined),
    ) as Partial<Campaign>;

    if (!draftCampaignId) {
      const draftCampaign = await createCampaign.mutateAsync({
        status: "in_progress",
        date_created: new Date().toISOString(),
        ...campaignData,
      });

      setDraftCampaignId(draftCampaign.campaign_id);
      setLastSaved(getFormattedSaveTime());
      return draftCampaign.campaign_id;
    }

    if (Object.keys(campaignData).length === 0) {
      return draftCampaignId;
    }

    await updateCampaign.mutateAsync({
      campaignId: draftCampaignId,
      campaignData: campaignData,
    });
    setLastSaved(getFormattedSaveTime());
    return draftCampaignId;
  };

  return {
    draftCampaignId,
    saveDraftCampaign,
    isCreatingDraft: createCampaign.isPending,
    isUpdatingDraft: updateCampaign.isPending,
  };
}
