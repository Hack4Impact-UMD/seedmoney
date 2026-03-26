"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sampleCampaigns } from "./sampleCampaigns";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {

    if (sampleCampaigns.length > 0) {
      router.replace(`/dashboard/${sampleCampaigns[0].campaign_id}`);
    }
  }, [user, router]);

  const handleNewCampaign = () => {
    console.log("New campaign clicked");
    router.push("/dashboard/new");
  };

  if (!user || sampleCampaigns.length > 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Dashboard</h3>
        <div className="flex items-center justify-center mt-10">
          <NotStarted onNewCampaign={handleNewCampaign} />
        </div>
      </div>
    </div>
  );
}