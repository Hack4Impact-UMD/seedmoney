import type { PublicLeaderboardData } from "@/src/types/frontend/leaderboard";

const leaderboardImage =
  "https://www.figma.com/api/mcp/asset/828dd6ca-f2a6-4b8d-9ee8-9bdfce734f31";

const campaigns = [
  {
    campaignId: 1,
    name: "Portland Urban Orchard",
    location: "Portland, Oregon",
    raised: 10400,
    goal: 15000,
    donors: 75,
    projectCategory: "Urban Garden",
    donateUrl: "#",
    summary:
      "Planting 500 heirloom fruit trees across inner-city Portland to combat food deserts and provide shade.",
    imageUrl: leaderboardImage,
  },
  {
    campaignId: 2,
    name: "Seattle Community Garden",
    location: "Seattle, Washington",
    raised: 9800,
    goal: 15000,
    donors: 68,
    projectCategory: "Community Garden",
    donateUrl: "#",
    summary:
      "Expanding neighborhood food access with year-round beds, volunteer training, and youth harvest days.",
    imageUrl: leaderboardImage,
  },
  {
    campaignId: 3,
    name: "Sunflower Garden",
    location: "Austin, Texas",
    raised: 9100,
    goal: 14000,
    donors: 59,
    projectCategory: "School Garden",
    donateUrl: "#",
    summary:
      "Building a campus garden that supports science education, nutrition lessons, and student leadership.",
    imageUrl: leaderboardImage,
  },
  {
    campaignId: 4,
    name: "Eastside Learning Garden",
    location: "Detroit, Michigan",
    raised: 8300,
    goal: 12000,
    donors: 52,
    projectCategory: "School Garden",
    donateUrl: "#",
    summary:
      "Restoring an underused lot into a teaching garden with raised beds, composting, and outdoor classrooms.",
    imageUrl: leaderboardImage,
  },
  {
    campaignId: 5,
    name: "Riverbend Food Forest",
    location: "Louisville, Kentucky",
    raised: 7600,
    goal: 13000,
    donors: 44,
    projectCategory: "Food Forest",
    donateUrl: "#",
    summary:
      "Creating a perennial food forest that supports community harvesting and local pollinator habitat.",
    imageUrl: leaderboardImage,
  },
  {
    campaignId: 6,
    name: "Civic Roots Garden",
    location: "Philadelphia, Pennsylvania",
    raised: 6900,
    goal: 11000,
    donors: 39,
    projectCategory: "Community Garden",
    donateUrl: "#",
    summary:
      "Launching a resident-led growing space focused on fresh produce distribution and community workshops.",
    imageUrl: leaderboardImage,
  },
];

const gardenCategories = Array.from(
  new Set(campaigns.map((campaign) => campaign.projectCategory)),
).sort((left, right) => left.localeCompare(right));

const mockLeaderboardData: PublicLeaderboardData = {
  challengeTitle: "The 2026 SeedMoney Challenge",
  totalCampaigns: campaigns.length,
  totalRaised: campaigns.reduce((sum, campaign) => sum + campaign.raised, 0),
  totalDonors: campaigns.reduce((sum, campaign) => sum + campaign.donors, 0),
  gardenCategories,
  campaigns,
};

export default mockLeaderboardData;
