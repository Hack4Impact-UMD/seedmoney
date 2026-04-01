import type { Status } from "@/src/types/db/enums";

export type MockCampaign = {
  campaign_id: string;
  name: string;
  status: Status;
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
      { campaign_id: 'c1', name: 'Summer Kickstarter', status: 'submitted_under_review' },
      { campaign_id: 'c2', name: 'Back to School Fund', status: 'in_progress' },
    ],
  },
  {
    id: '2', first_name: 'Bob', last_name: 'Martinez', email: 'bob.martinez@gmail.com',
    campaigns: [
      { campaign_id: 'c3', name: 'Community Garden Project', status: 'approved' },
      { campaign_id: 'c4', name: 'Youth Sports League', status: 'published' },
      { campaign_id: 'c5', name: 'Holiday Toy Drive', status: 'in_progress' },
      { campaign_id: 'c18', name: 'River Cleanup Initiative', status: 'approved' },
      { campaign_id: 'c19', name: 'After School Tutoring', status: 'submitted_under_review' },
      { campaign_id: 'c20', name: 'Senior Meal Delivery', status: 'published' },
      { campaign_id: 'c21', name: 'Playground Renovation', status: 'approved' },
      { campaign_id: 'c22', name: 'Free Health Clinic', status: 'in_progress' },
      { campaign_id: 'c23', name: 'Bike Lane Expansion', status: 'submitted_under_review' },
      { campaign_id: 'c24', name: 'Tree Planting Drive', status: 'approved' },
      { campaign_id: 'c25', name: 'Homeless Shelter Expansion', status: 'not_approved' },
      { campaign_id: 'c26', name: 'Digital Literacy Program', status: 'in_progress' },
      { campaign_id: 'c27', name: 'Farmers Market Launch', status: 'published' },
      { campaign_id: 'c28', name: 'Mural Arts Project', status: 'archived' },
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
      { campaign_id: 'c15', name: 'Winter Coat Drive', status: 'not_approved' },
    ],
  },
  {
    id: '5', first_name: 'Eva', last_name: 'Nguyen', email: 'eva.nguyen@gmail.com',
    campaigns: [
      { campaign_id: 'c7', name: 'Clean Water Initiative', status: 'published' },
      { campaign_id: 'c8', name: 'Neighborhood Cleanup', status: 'approved' },
      { campaign_id: 'c1', name: 'Summer Kickstarter', status: 'in_progress' },
      { campaign_id: 'c9', name: 'Tech for Seniors', status: 'archived' },
    ],
  },
  {
    id: '6', first_name: 'Frank', last_name: 'Patel', email: 'frank.patel@gmail.com',
    campaigns: [
      { campaign_id: 'c10', name: 'Food Bank Fundraiser', status: 'submitted_under_review' },
    ],
  },
  {
    id: '7', first_name: 'Grace', last_name: 'Wilson', email: 'grace.wilson@gmail.com',
    campaigns: [
      { campaign_id: 'c3', name: 'Community Garden Project', status: 'approved' },
      { campaign_id: 'c11', name: 'Literacy Program', status: 'submitted_under_review' },
    ],
  },
  {
    id: '8', first_name: 'Henry', last_name: 'Chen', email: 'henry.chen@gmail.com',
    campaigns: [
      { campaign_id: 'c16', name: 'STEM Workshop Series', status: 'in_progress' },
    ],
  },
  {
    id: '9', first_name: 'Isabel', last_name: 'Garcia', email: 'isabel.garcia@gmail.com',
    campaigns: [
      { campaign_id: 'c12', name: 'Animal Shelter Support', status: 'not_approved' },
    ],
  },
  {
    id: '10', first_name: 'James', last_name: 'Brown', email: 'james.brown@gmail.com',
    campaigns: [
      { campaign_id: 'c4', name: 'Youth Sports League', status: 'published' },
      { campaign_id: 'c7', name: 'Clean Water Initiative', status: 'in_progress' },
      { campaign_id: 'c13', name: 'Music Education Fund', status: 'archived' },
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
      { campaign_id: 'c9', name: 'Tech for Seniors', status: 'submitted_under_review' },
      { campaign_id: 'c14', name: 'Park Restoration', status: 'in_progress' },
    ],
  },
  {
    id: '13', first_name: 'Maya', last_name: 'Robinson', email: 'maya.robinson@gmail.com',
    campaigns: [
      { campaign_id: 'c17', name: 'Book Drive for Schools', status: 'not_approved' },
    ],
  },
  {
    id: '14', first_name: 'Noah', last_name: 'Walker', email: 'noah.walker@gmail.com',
    campaigns: [],
  },
];
