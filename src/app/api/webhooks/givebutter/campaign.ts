import { WebhookPayload } from "./types";
import { updateCampaignGivebutterID, createCampaign } from "@/src/actions/db/campaigns";
import moment from "moment";

export const campaignHandlers = {
  "campaign.updated": async (payload: WebhookPayload) => {
    if (!payload.data) return;
    console.log(payload);
    await updateCampaignGivebutterID(Number(payload.data.id), {
      givebutter_id: String(payload.data.id),
      givebutter_slug: payload.data.slug,
      name: payload.data.title,
      givebutterlink: payload.data.url,
      raised: payload.data.raised,
      donors: payload.data.donors,
      goal: payload.data.goal ?? 0,
      status: "approved",
    });
  },
  "campaign.created": async (payload: WebhookPayload) => {
    if (!payload.data) return;
    await createCampaign({
      givebutter_id: String(payload.data.id),
      givebutter_slug: payload.data.slug,
      name: payload.data.title,
      givebutterlink: payload.data.url,
      raised: payload.data.raised,
      donors: payload.data.donors,
      goal: payload.data.goal ?? 0,
      status: "in_progress",
      street: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      project_category: "",
      project_beneficiaries: [],
      existence: "new",
      impact: 0,
      size: 0,
      ein: "",
      mailing_street: "",
      mailing_city: "",
      mailing_state: "",
      mailing_country: "",
      mailing_zipcode: "",
      date_created: moment(payload.data.created_at).format("YYYY-MM-DD"),
    });
  },
};