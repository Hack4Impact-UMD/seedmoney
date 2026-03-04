import type { Existence, Status } from "./enums";

export type Campaign = {
  campaign_id: number;
  name: string;
  givebutterlink: string;
  status: Status;
  date_created: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  project_category: string;
  project_beneficiaries: string[];
  existence: Existence;
  impact: number;
  size: number;
  goal: number;
  ein: string;
  mailing_street: string;
  mailing_city: string;
  mailing_state: string;
  mailing_country: string;
  mailing_zipcode: string;
};

export type NewCampaign = Omit<Campaign, "campaign_id" | "date_created">;

export type GivebutterCampaignPayload = {
  id: string;
  code: string;
  account_id: string;
  event_id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  url: string;
  goal: number;
  raised: number;
  donors: number;
  currency: string;
  cover: string;
  status: string;
  timezone: string;
  end_at: string;
  settings: {
    name: string;
    value: string;
  }[];
  created_at: string;
  updated_at: string;
  event: {
    title: string;
    type: string;
    location_name: string;
    address_formatted: string;
    google_place_id: string;
    start_at: string;
    end_at: string;
    timezone: string;
    details: string;
    private: string;
    tickets_required: string;
    livestream: string;
    livestream_start_at: string;
    livestream_end_at: string;
    created_at: string;
    updated_at: string;
  };
};

export type GivebutterCampaignUpdatePayload = Partial<
  Pick<
    GivebutterCampaignPayload,
    | "title"
    | "subtitle"
    | "description"
    | "goal"
    | "status"
    | "end_at"
    | "timezone"
    | "cover"
    | "slug"
    | "settings"
  >
>;
