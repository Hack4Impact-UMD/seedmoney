import { Campaign } from "../db/campaigns";

export type UserCampaign = Pick<
  Campaign,
  "campaign_id" | "name" | "status" | "competition_id"
>;

export type UsersTableRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  campaigns: UserCampaign[];
};