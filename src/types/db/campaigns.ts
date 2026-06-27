import type { Existence, Status } from "./enums";

export type Campaign = {
  campaign_id: number;
  name: string;
  organization_name: string;
  givebutterlink: string;
  givebutter_id: string;
  givebutter_slug: string;
  raised: number;
  donors: number;
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
  size: string;
  goal: number;
  ein: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_role: string;
  mailing_street_1: string | null;
  mailing_street_2?: string | null;
  mailing_city: string;
  mailing_state: string;
  mailing_country: string;
  mailing_zipcode: string;
  competition_id: number | null;
  opt_in_ai: boolean;
};

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
  status: string;
  timezone: string;
  end_at: string;
  settings: {
    name: string;
    value: string | boolean;
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
  cover?: {
    source: "upload";
    type: "image";
    url: string;
  } 
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
