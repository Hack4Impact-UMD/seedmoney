/** Database enum representing a campaign member's role. */
export type Role = 'campaign_leader' | 'campaign_member';

/** Database enum representing whether a campaign is new or existing. */
export type CampaignExistence = 'new' | 'existing';

/** Database enum representing a campaign's workflow status. */
export type CampaignStatus =
  | 'in_progress'
  | 'submitted_under_review'
  | 'approved'
  | 'not_approved';

/** Runtime values for `Role` for convenient reuse in code. */
export const RoleValues = {
  campaign_leader: 'campaign_leader',
  campaign_member: 'campaign_member',
} as const;

/** Runtime values for `CampaignExistence` for convenient reuse in code. */
export const CampaignExistenceValues = {
  new: 'new',
  existing: 'existing',
} as const;

/** Runtime values for `CampaignStatus` for convenient reuse in code. */
export const CampaignStatusValues = {
  in_progress: 'in_progress',
  submitted_under_review: 'submitted_under_review',
  approved: 'approved',
  not_approved: 'not_approved',
} as const;
