import CampaignsTable from "@/src/components/CampaignsTable";

export default async function ViewAllCampaignsPage() {
  const mockCampaignData = [
    {
    name: "Save the Oceans",
    campaign_leader: "Sarah Lee",
    raised: 5000,
    goal: 20000,
    percentage: 25,
    },
    {
    name: "Feed the Children",
    campaign_leader: "John Smith",
    raised: 12000,
    goal: 15000,
    percentage: 80,
    },
    {
    name: "Plant More Trees",
    campaign_leader: "Emily Chen",
    raised: 3000,
    goal: 10000,
    percentage: 30,
    },
  ];

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f2faf9]">
      <CampaignsTable initialData={mockCampaignData}/>
    </main>
  );
}