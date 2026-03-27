"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sampleCampaigns } from "./sampleCampaigns";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: userData, isLoading } = useUserByAuthId(user?.id || "");

  useEffect(() => {
    if (isLoading) return;
    if (!userData) return;

    if (sampleCampaigns.length > 0 && !userData.is_admin) {
      router.replace(`/dashboard/${sampleCampaigns[0].campaign_id}`);
    }
  }, [userData, isLoading, router]);

  const handleNewCampaign = () => {
    console.log("New campaign clicked");
    router.push("/dashboard/new");
  };

  if (!userData) return null;

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Dashboard</h3>

        {!userData.is_admin && (
          <>
            <div className="mt-10 flex items-center justify-center">
              <NotStarted onNewCampaign={handleNewCampaign} />
            </div>
          </>
          
        )}

      </div>
    </div>
  );
}