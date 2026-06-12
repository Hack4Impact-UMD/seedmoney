"use client";

import { Campaign } from "@/src/types/db/campaigns";
import {
  useDraftCampaignId,
  useLastSaved,
  useApplicationForm,
} from "@/src/components/application/ApplicationFormProvider";
import useCreateCampaign from "@/src/hooks/campaigns/useCreateCampaign";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import { useEffect, useRef } from "react";
import { sendDraftSavedEmailOnce } from "@/src/actions/db/campaigns";

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
  const draftCampaignIdRef = useRef<number | null>(draftCampaignId);
  const creatingDraftPromiseRef = useRef<Promise<number> | null>(null);

  useEffect(() => {
    draftCampaignIdRef.current = draftCampaignId;
  }, [draftCampaignId]);

  const saveDraftCampaign = async (campaignData: Partial<Campaign>) => {
    const filteredCampaignData = Object.fromEntries(
      Object.entries(campaignData).filter(([, value]) => value !== undefined),
    ) as Partial<Campaign>;
    const campaignPayload: Partial<Campaign> = {
      ...filteredCampaignData,
      opt_in_ai: form.state.values.aiOptIn,
    };

    const currentDraftCampaignId = draftCampaignIdRef.current;

    if (!currentDraftCampaignId) {
      let createdInThisCall = false;

      if (!creatingDraftPromiseRef.current) {
        createdInThisCall = true;
        creatingDraftPromiseRef.current = createCampaign
          .mutateAsync({
            status: "in_progress",
            date_created: new Date().toISOString(),
            ...campaignPayload,
          })
          .then(async (draftCampaign) => {
            draftCampaignIdRef.current = draftCampaign.campaign_id;
            setDraftCampaignId(draftCampaign.campaign_id);
            await sendDraftSavedEmailOnce(draftCampaign.campaign_id);
            return draftCampaign.campaign_id;
          })
          .finally(() => {
            creatingDraftPromiseRef.current = null;
          });
      }

      const nextDraftCampaignId = await creatingDraftPromiseRef.current;

      if (!createdInThisCall) {
        await updateCampaign.mutateAsync({
          campaignId: nextDraftCampaignId,
          campaignData: campaignPayload,
        });
      }

      setLastSaved(getFormattedSaveTime());
      return nextDraftCampaignId;
    }

    await updateCampaign.mutateAsync({
      campaignId: currentDraftCampaignId,
      campaignData: campaignPayload,
    });
    await sendDraftSavedEmailOnce(currentDraftCampaignId);
    setLastSaved(getFormattedSaveTime());
    return currentDraftCampaignId;
  };

  return {
    draftCampaignId,
    saveDraftCampaign,
    isCreatingDraft: createCampaign.isPending,
    isUpdatingDraft: updateCampaign.isPending,
  };
}
