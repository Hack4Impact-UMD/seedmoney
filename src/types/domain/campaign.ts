import type { CampaignExistence, CampaignStatus } from '../db/enums';

/** Reusable address object for UI/domain models (camelCase). */
export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

/** Application/UI-friendly campaign model (camelCase + nested addresses). */
export type Campaign = {
  campaignId: number;
  name: string;
  givebutterLink: string;
  status: CampaignStatus;
  dateCreated: string;
  address: Address;
  mailingAddress: Address;
  projectCategory: string;
  projectBeneficiaries: string[];
  existence: CampaignExistence;
  impact: number;
  size: number;
  goal: number;
  ein: string;
};
