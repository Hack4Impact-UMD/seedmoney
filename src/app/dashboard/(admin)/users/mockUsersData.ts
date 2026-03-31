export type CampaignStatus = 'submitted' | 'approved' | 'in_progress' | 'not_started';

export type MockCampaign = {
  campaign_id: string;
  name: string;
  status: CampaignStatus;
};

export type MockUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  campaigns: MockCampaign[];
};

export const mockUsers: MockUser[] = [
  {
    id: '1', first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@gmail.com',
    campaigns: [
      { campaign_id: 'c1', name: 'Summer Kickstarter', status: 'submitted' },
      { campaign_id: 'c2', name: 'Back to School Fund', status: 'not_started' },
    ],
  },
  {
    id: '2', first_name: 'Bob', last_name: 'Martinez', email: 'bob.martinez@gmail.com',
    campaigns: [
      { campaign_id: 'c3', name: 'Community Garden Project', status: 'approved' },
      { campaign_id: 'c4', name: 'Youth Sports League', status: 'approved' },
      { campaign_id: 'c5', name: 'Holiday Toy Drive', status: 'in_progress' },
    ],
  },
  {
    id: '3', first_name: 'Carol', last_name: 'Lee', email: 'carol.lee@gmail.com',
    campaigns: [
      { campaign_id: 'c6', name: 'Local Art Exhibition', status: 'in_progress' },
    ],
  },
  {
    id: '4', first_name: 'David', last_name: 'Kim', email: 'david.kim@gmail.com',
    campaigns: [
      { campaign_id: 'c15', name: 'Winter Coat Drive', status: 'not_started' },
    ],
  },
  {
    id: '5', first_name: 'Eva', last_name: 'Nguyen', email: 'eva.nguyen@gmail.com',
    campaigns: [
      { campaign_id: 'c7', name: 'Clean Water Initiative', status: 'approved' },
      { campaign_id: 'c8', name: 'Neighborhood Cleanup', status: 'approved' },
      { campaign_id: 'c1', name: 'Summer Kickstarter', status: 'in_progress' },
      { campaign_id: 'c9', name: 'Tech for Seniors', status: 'not_started' },
    ],
  },
  {
    id: '6', first_name: 'Frank', last_name: 'Patel', email: 'frank.patel@gmail.com',
    campaigns: [
      { campaign_id: 'c10', name: 'Food Bank Fundraiser', status: 'submitted' },
    ],
  },
  {
    id: '7', first_name: 'Grace', last_name: 'Wilson', email: 'grace.wilson@gmail.com',
    campaigns: [
      { campaign_id: 'c3', name: 'Community Garden Project', status: 'approved' },
      { campaign_id: 'c11', name: 'Literacy Program', status: 'submitted' },
    ],
  },
  {
    id: '8', first_name: 'Henry', last_name: 'Chen', email: 'henry.chen@gmail.com',
    campaigns: [
      { campaign_id: 'c16', name: 'STEM Workshop Series', status: 'not_started' },
    ],
  },
  {
    id: '9', first_name: 'Isabel', last_name: 'Garcia', email: 'isabel.garcia@gmail.com',
    campaigns: [
      { campaign_id: 'c12', name: 'Animal Shelter Support', status: 'in_progress' },
    ],
  },
  {
    id: '10', first_name: 'James', last_name: 'Brown', email: 'james.brown@gmail.com',
    campaigns: [
      { campaign_id: 'c4', name: 'Youth Sports League', status: 'approved' },
      { campaign_id: 'c7', name: 'Clean Water Initiative', status: 'in_progress' },
      { campaign_id: 'c13', name: 'Music Education Fund', status: 'not_started' },
    ],
  },
  {
    id: '11', first_name: 'Karen', last_name: 'Davis', email: 'karen.davis@gmail.com',
    campaigns: [
      { campaign_id: 'c11', name: 'Literacy Program', status: 'approved' },
    ],
  },
  {
    id: '12', first_name: 'Liam', last_name: 'Taylor', email: 'liam.taylor@gmail.com',
    campaigns: [
      { campaign_id: 'c9', name: 'Tech for Seniors', status: 'submitted' },
      { campaign_id: 'c14', name: 'Park Restoration', status: 'in_progress' },
    ],
  },
  {
    id: '13', first_name: 'Maya', last_name: 'Robinson', email: 'maya.robinson@gmail.com',
    campaigns: [
      { campaign_id: 'c17', name: 'Book Drive for Schools', status: 'not_started' },
    ],
  },
];
