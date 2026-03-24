export type Role = 'campaign_leader' | 'campaign_member';

export type Existence = 'new' | 'existing';

export type Status =
  | 'in_progress'
  | 'submitted_under_review'
  | 'approved'
  | 'not_approved'
  | 'published'
  | 'archived';
