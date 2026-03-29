export type ApplicationStatus = 'submitted' | 'approved' | 'in_progress' | 'not_started' | 'mixed';

export type MockUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  application_status: ApplicationStatus;
  campaign_count: number;
};

export const mockUsers: MockUser[] = [
  { id: '1', first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@gmail.com', application_status: 'submitted', campaign_count: 2 },
  { id: '2', first_name: 'Bob', last_name: 'Martinez', email: 'bob.martinez@gmail.com', application_status: 'approved', campaign_count: 3 },
  { id: '3', first_name: 'Carol', last_name: 'Lee', email: 'carol.lee@gmail.com', application_status: 'in_progress', campaign_count: 1 },
  { id: '4', first_name: 'David', last_name: 'Kim', email: 'david.kim@gmail.com', application_status: 'not_started', campaign_count: 0 },
  { id: '5', first_name: 'Eva', last_name: 'Nguyen', email: 'eva.nguyen@gmail.com', application_status: 'mixed', campaign_count: 4 },
  { id: '6', first_name: 'Frank', last_name: 'Patel', email: 'frank.patel@gmail.com', application_status: 'submitted', campaign_count: 1 },
  { id: '7', first_name: 'Grace', last_name: 'Wilson', email: 'grace.wilson@gmail.com', application_status: 'approved', campaign_count: 2 },
  { id: '8', first_name: 'Henry', last_name: 'Chen', email: 'henry.chen@gmail.com', application_status: 'not_started', campaign_count: 0 },
  { id: '9', first_name: 'Isabel', last_name: 'Garcia', email: 'isabel.garcia@gmail.com', application_status: 'in_progress', campaign_count: 1 },
  { id: '10', first_name: 'James', last_name: 'Brown', email: 'james.brown@gmail.com', application_status: 'mixed', campaign_count: 3 },
  { id: '11', first_name: 'Karen', last_name: 'Davis', email: 'karen.davis@gmail.com', application_status: 'approved', campaign_count: 1 },
  { id: '12', first_name: 'Liam', last_name: 'Taylor', email: 'liam.taylor@gmail.com', application_status: 'submitted', campaign_count: 2 },
  { id: '13', first_name: 'Maya', last_name: 'Robinson', email: 'maya.robinson@gmail.com', application_status: 'not_started', campaign_count: 0 },
];
