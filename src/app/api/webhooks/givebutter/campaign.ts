import { WebhookPayload } from "./types";

export const campaignHandlers = {
  "campaign.updated": async (payload: WebhookPayload) => {
    // Type in updated campaign code here :DDDD
  },
  "campaign.created": async (payload: WebhookPayload) => {
    // Type in code when campaign is created here
  },
};