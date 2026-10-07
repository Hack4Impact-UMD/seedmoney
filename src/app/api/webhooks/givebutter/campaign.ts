import { GivebuttercampaignPayload } from "./types";
import { updateCampaignGivebutterID } from "@/src/actions/db/campaigns";
import { createServiceRoleClient } from "@/src/lib/supabase-service";

export const campaignHandlers = {
  "campaign.updated": async (payload: GivebuttercampaignPayload) => {
    if (!payload.data) return;
    console.log(payload);
    await updateCampaignGivebutterID(Number(payload.data.id), {
      givebutter_id: String(payload.data.id),
      givebutter_slug: payload.data.code ?? payload.data.slug,
      name: payload.data.title,
      givebutterlink: payload.data.url,
      raised: payload.data.raised,
      donors: payload.data.donors,
      goal: payload.data.goal ?? 0,
    });
  },
  "campaign.created": async (payload: GivebuttercampaignPayload) => {
    if (!payload.data) return;
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("campaigns")
      .update({
        givebutter_id: String(payload.data.id),
        givebutter_slug: payload.data.slug,
        givebutterlink: payload.data.url,
      })
      .eq("givebutter_slug", payload.data.slug)
      .select("campaign_id");

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.length) {
      console.warn(
        `No local campaign reserved Givebutter slug ${payload.data.slug}`,
      );
    }
  },
};
