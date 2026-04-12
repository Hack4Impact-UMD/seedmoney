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
      organization_name: "",
      givebutterlink: payload.data.url,
      raised: payload.data.raised,
      donors: payload.data.donors,
      goal: payload.data.goal ?? 0,
      status: "approved",
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
      contact_first_name: "",
      contact_last_name: "",
      contact_email: "",
      contact_role: "",
      mailing_street_1: "",
      mailing_street_2: "",
      mailing_city: "",
      mailing_state: "",
      mailing_country: "",
      mailing_zipcode: "",
      date_created: moment(payload.data.created_at).format("YYYY-MM-DD"),
      competition_id: 1
    });
  },
};
