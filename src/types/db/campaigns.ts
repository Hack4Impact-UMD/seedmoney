import type { CampaignExistence, CampaignStatus } from './enums';

/** Row shape for the `campaign` table (DB columns, snake_case). */
export type DbCampaignRow = {
  campaign_id: number;
  name: string;
  givebutter_link: string;
  status: CampaignStatus;
  date_created: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  project_category: string;
  project_beneficiaries: string[];
  existence: CampaignExistence;
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
