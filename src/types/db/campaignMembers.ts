import type { Role } from './enums';

/** Row shape for the `campaign_member` join table (DB columns, snake_case). */
export type DbCampaignMemberRow = {
  user_id: number;
  campaign_id: number;
  role: Role;
};
