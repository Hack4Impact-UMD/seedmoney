"use client";

import { useRouter } from "next/navigation";
import CampaignsTable from "@/src/components/CampaignsTable";
import Navbar from "@/src/components/Navbar";
import { sampleCampaigns } from "../../sampleCampaigns";
import { useAuth } from "@/src/context/AuthProvider";

export default function ViewAllCampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

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

  const selectedCampaignId = sampleCampaigns[0].campaign_id;

  const handleCampaignChange = (newCampaignId: number) => {
    router.push(`/dashboard/${newCampaignId}`);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1 bg-gray-50 p-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#096B2E]">All Campaigns</h1>
            <p className="mt-2 text-gray-600">
              View and manage all campaigns in one place.
            </p>
          </div>

          <CampaignsTable initialData={mockCampaignData} />
        </div>
      </div>
    </div>
  );
}