import type { Role } from "./enums";

export type CampaignMember = {
  user_id: string;
  campaign_id: number;
  role: Role;
};
