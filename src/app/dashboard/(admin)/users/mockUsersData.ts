import type { Campaign } from "@/src/types/db/campaigns";
import type { CampaignMember } from "@/src/types/db/campaignMembers";
import type { Users } from "@/src/types/db/users";

export type MockCampaign = Pick<Campaign, "campaign_id" | "name" | "status">;

export type MockUserRecord = Pick<
  Users,
  "id" | "first_name" | "last_name" | "email"
>;

export type MockUsersTableRow = MockUserRecord & {
  campaigns: MockCampaign[];
};

export const mockUsers: MockUserRecord[] = [
  {
    id: "1",
    first_name: "Alice",
    last_name: "Johnson",
    email: "alice.johnson@gmail.com",
  },
  {
    id: "2",
    first_name: "Bob",
    last_name: "Martinez",
    email: "bob.martinez@gmail.com",
  },
  {
    id: "3",
    first_name: "Carol",
    last_name: "Lee",
    email: "carol.lee@gmail.com",
  },
  {
    id: "4",
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@gmail.com",
  },
  {
    id: "5",
    first_name: "Eva",
    last_name: "Nguyen",
    email: "eva.nguyen@gmail.com",
  },
  {
    id: "6",
    first_name: "Frank",
    last_name: "Patel",
    email: "frank.patel@gmail.com",
  },
  {
    id: "7",
    first_name: "Grace",
    last_name: "Wilson",
    email: "grace.wilson@gmail.com",
  },
  {
    id: "8",
    first_name: "Henry",
    last_name: "Chen",
    email: "henry.chen@gmail.com",
  },
  {
    id: "9",
    first_name: "Isabel",
    last_name: "Garcia",
    email: "isabel.garcia@gmail.com",
  },
  {
    id: "10",
    first_name: "James",
    last_name: "Brown",
    email: "james.brown@gmail.com",
  },
  {
    id: "11",
    first_name: "Karen",
    last_name: "Davis",
    email: "karen.davis@gmail.com",
  },
  {
    id: "12",
    first_name: "Liam",
    last_name: "Taylor",
    email: "liam.taylor@gmail.com",
  },
  {
    id: "13",
    first_name: "Maya",
    last_name: "Robinson",
    email: "maya.robinson@gmail.com",
  },
  {
    id: "14",
    first_name: "Noah",
    last_name: "Walker",
    email: "noah.walker@gmail.com",
  },
];

export const mockCampaigns: MockCampaign[] = [
  { campaign_id: 1, name: "Summer Kickstarter", status: "pending" },
  { campaign_id: 2, name: "Back to School Fund", status: "in_progress" },
  { campaign_id: 3, name: "Community Garden Project", status: "approved" },
  { campaign_id: 4, name: "Youth Sports League", status: "published" },
  { campaign_id: 5, name: "Holiday Toy Drive", status: "in_progress" },
  { campaign_id: 6, name: "Local Art Exhibition", status: "in_progress" },
  { campaign_id: 7, name: "Clean Water Initiative", status: "published" },
  { campaign_id: 8, name: "Neighborhood Cleanup", status: "approved" },
  { campaign_id: 9, name: "Tech for Seniors", status: "archived" },
  { campaign_id: 10, name: "Food Bank Fundraiser", status: "pending" },
  { campaign_id: 11, name: "Literacy Program", status: "pending" },
  { campaign_id: 12, name: "Animal Shelter Support", status: "denied" },
  { campaign_id: 13, name: "Music Education Fund", status: "archived" },
  { campaign_id: 14, name: "Park Restoration", status: "in_progress" },
  { campaign_id: 15, name: "Winter Coat Drive", status: "denied" },
  { campaign_id: 16, name: "STEM Workshop Series", status: "in_progress" },
  { campaign_id: 17, name: "Book Drive for Schools", status: "denied" },
  { campaign_id: 18, name: "River Cleanup Initiative", status: "approved" },
  { campaign_id: 19, name: "After School Tutoring", status: "pending" },
  { campaign_id: 20, name: "Senior Meal Delivery", status: "published" },
  { campaign_id: 21, name: "Playground Renovation", status: "approved" },
  { campaign_id: 22, name: "Free Health Clinic", status: "in_progress" },
  { campaign_id: 23, name: "Bike Lane Expansion", status: "pending" },
  { campaign_id: 24, name: "Tree Planting Drive", status: "approved" },
  { campaign_id: 25, name: "Homeless Shelter Expansion", status: "denied" },
  { campaign_id: 26, name: "Digital Literacy Program", status: "in_progress" },
  { campaign_id: 27, name: "Farmers Market Launch", status: "published" },
  { campaign_id: 28, name: "Mural Arts Project", status: "archived" },
];

export const mockCampaignMembers: CampaignMember[] = [
  { user_id: "1", campaign_id: 1, role: "campaign_leader" },
  { user_id: "1", campaign_id: 2, role: "campaign_member" },
  { user_id: "2", campaign_id: 3, role: "campaign_leader" },
  { user_id: "2", campaign_id: 4, role: "campaign_member" },
  { user_id: "2", campaign_id: 5, role: "campaign_member" },
  { user_id: "2", campaign_id: 18, role: "campaign_member" },
  { user_id: "2", campaign_id: 19, role: "campaign_member" },
  { user_id: "2", campaign_id: 20, role: "campaign_member" },
  { user_id: "2", campaign_id: 21, role: "campaign_member" },
  { user_id: "2", campaign_id: 22, role: "campaign_member" },
  { user_id: "2", campaign_id: 23, role: "campaign_member" },
  { user_id: "2", campaign_id: 24, role: "campaign_member" },
  { user_id: "2", campaign_id: 25, role: "campaign_member" },
  { user_id: "2", campaign_id: 26, role: "campaign_member" },
  { user_id: "2", campaign_id: 27, role: "campaign_member" },
  { user_id: "2", campaign_id: 28, role: "campaign_member" },
  { user_id: "3", campaign_id: 6, role: "campaign_leader" },
  { user_id: "4", campaign_id: 15, role: "campaign_leader" },
  { user_id: "5", campaign_id: 7, role: "campaign_leader" },
  { user_id: "5", campaign_id: 8, role: "campaign_member" },
  { user_id: "5", campaign_id: 1, role: "campaign_member" },
  { user_id: "5", campaign_id: 9, role: "campaign_member" },
  { user_id: "6", campaign_id: 10, role: "campaign_leader" },
  { user_id: "7", campaign_id: 3, role: "campaign_member" },
  { user_id: "7", campaign_id: 11, role: "campaign_leader" },
  { user_id: "8", campaign_id: 16, role: "campaign_leader" },
  { user_id: "9", campaign_id: 12, role: "campaign_leader" },
  { user_id: "10", campaign_id: 4, role: "campaign_member" },
  { user_id: "10", campaign_id: 7, role: "campaign_member" },
  { user_id: "10", campaign_id: 13, role: "campaign_leader" },
  { user_id: "11", campaign_id: 11, role: "campaign_member" },
  { user_id: "12", campaign_id: 9, role: "campaign_member" },
  { user_id: "12", campaign_id: 14, role: "campaign_leader" },
  { user_id: "13", campaign_id: 17, role: "campaign_leader" },
];

function buildMockUsersTableRows(): MockUsersTableRow[] {
  const campaignsById = new Map(
    mockCampaigns.map((campaign) => [campaign.campaign_id, campaign]),
  );

  // This matches the real flow: load users, match them to campaign_members, then attach the campaigns.
  // If there are no matches, the table shows Not Started.
  return mockUsers.map((user) => {
    const userCampaigns = mockCampaignMembers
      .filter((member) => member.user_id === user.id)
      .map((member) => campaignsById.get(member.campaign_id))
      .filter((campaign): campaign is MockCampaign => Boolean(campaign));

    return {
      ...user,
      campaigns: userCampaigns,
    };
  });
}

export const mockUsersTableRows = buildMockUsersTableRows();
