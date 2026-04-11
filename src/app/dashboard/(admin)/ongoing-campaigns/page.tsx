"use client";
import Navbar from "@/src/components/Navbar";
import CampaignsTable from "@/src/components/CampaignsTable";

const mockCampaignData = [
  {
    name: "Community Garden Expansion",
    campaign_leader: "Alice Johnson",
    raised: 15000,
    goal: 15000,
    percentage: 100,
  },
  {
    name: "Save the Local Wetlands",
    campaign_leader: "Robert Smith",
    raised: 450,
    goal: 10000,
    percentage: 5,
  },
  {
    name: "Youth Coding Bootcamp",
    campaign_leader: "Sarah Connor",
    raised: 8500,
    goal: 10000,
    percentage: 85,
  },
  {
    name: "Downtown Arts Festival",
    campaign_leader: "Michael Chang",
    raised: 12000,
    goal: 8000,
    percentage: 150,
  },
  {
    name: "Ocean Cleanup Initiative",
    campaign_leader: "Elena Rodriguez",
    raised: 0,
    goal: 25000,
    percentage: 0,
  },
  {
    name: "School Breakfast Program",
    campaign_leader: "David Miller",
    raised: 2500,
    goal: 5000,
    percentage: 50,
  },
  {
    name: "Urban Tree Canopy Project",
    campaign_leader: "James Wilson",
    raised: 18000,
    goal: 20000,
    percentage: 90,
  },
];
export default function OngoingApplicationsPage() {
  return (
    <div className="flex min-h-screen">
      <Navbar/>
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E] mb-5">Ongoing Campaigns</h3>
        <CampaignsTable initialData={mockCampaignData}/>

      </div>
    </div>
    

  );
}