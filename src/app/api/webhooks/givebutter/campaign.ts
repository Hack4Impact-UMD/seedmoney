import { GivebuttercampaignPayload } from "./types";

export const campaignHandlers = {
  "campaign.updated": async (payload: GivebuttercampaignPayload) => {
    console.info("Ignoring campaign.updated webhook", payload.data?.id);
  },
  "campaign.created": async (payload: GivebuttercampaignPayload) => {
    console.info("Ignoring campaign.created webhook", payload.data?.id);
  },
};
