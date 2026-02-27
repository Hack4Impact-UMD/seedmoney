export const sampleCampaigns = [
  { id: "1", name: "Save the Ocean" },
  { id: "2", name: "Community Garden Project" },
  { id: "3", name: "Save the Garden" },
];

export const getCampaignById = (campaignId: string) => {
  return sampleCampaigns.find((campaign) => campaign.id === campaignId);
};
