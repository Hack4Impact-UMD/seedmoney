import type { Existence, Status } from './enums';

export type Campaign = {
  campaign_id: number;
  name: string;
  givebutterLink: string;
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
