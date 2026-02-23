import type { Role } from './enums';

export type Campaign_Member = {
  user_id: number;
  campaign_id: number;
  role: Role;
};
