"use client";

import { Campaign } from "@/src/types/db/campaigns";
import {
  useDraftCampaignId,
  useLastSaved,
  useApplicationForm,
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
  const form = useApplicationForm();
  const { draftCampaignId, setDraftCampaignId } = useDraftCampaignId();
  const { setLastSaved } = useLastSaved();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const saveDraftCampaign = async (campaignData: Partial<Campaign>) => {
    const filteredCampaignData = Object.fromEntries(
      Object.entries(campaignData).filter(([, value]) => value !== undefined),
    ) as Partial<Campaign>;
    const campaignPayload: Partial<Campaign> = {
      ...filteredCampaignData,
      opt_in_ai: form.state.values.aiOptIn,
    };

    if (!draftCampaignId) {
      const draftCampaign = await createCampaign.mutateAsync({
        status: "in_progress",
        date_created: new Date().toISOString(),
        ...campaignPayload,
      });

      setDraftCampaignId(draftCampaign.campaign_id);
      setLastSaved(getFormattedSaveTime());
      return draftCampaign.campaign_id;
    }

    await updateCampaign.mutateAsync({
      campaignId: draftCampaignId,
      campaignData: campaignPayload,
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
