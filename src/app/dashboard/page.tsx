"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import useReadCampaignsFromMembers from "@/src/hooks/campaign-members/useReadCampaignsFromMembers";

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();

  // const { data: userData, isLoading: isLoadingUser } = useUserByAuthId(user?.id || "");
  const userData = { first_name: "Alex", is_admin: true };
  const isLoadingUser = false;
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useReadCampaignsFromMembers(user?.id || "");

  const isLoading = isLoadingUser || isLoadingCampaigns;

  useEffect(() => {
    if (isLoading) return;
    if (!userData) return;

    if (campaigns.length > 0 && !userData.is_admin) {
      router.replace(`/dashboard/${campaigns[0].campaign_id}`);
    }


  }, [userData, campaigns, isLoading, router]);

  const handleNewCampaign = () => {
    router.push("/apply");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 p-10">
        <h3 className="text-4xl font-bold text-[#096B2E]">Dashboard</h3>

        {userData && !userData.is_admin && (
          <div className="mt-10 flex items-center justify-center">
            <NotStarted onNewCampaign={handleNewCampaign} />
          </div>
        )}
      </div>
    </div>
  );
}