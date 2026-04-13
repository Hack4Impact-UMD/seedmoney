"use client";

import { useRouter } from "next/navigation";
import CampaignsTable from "@/src/components/CampaignsTable";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";
import useReadCampaignsFromMembers from "@/src/hooks/campaign-members/useReadCampaignsFromMembers";
import Error from "@/src/app/error";
import Loading from "@/src/app/loading";

export default function ViewAllCampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: campaigns = [], isLoading, isError, error } = useReadCampaignsFromMembers(user?.id || "");

  if(isLoading)
    return <Loading/>;

  if(isError)
    return <Error error={error} reset = {() => {}}/>;

  if (!user) return null;

  const handleCampaignChange = (newCampaignId: number) => {
    router.push(`/dashboard/${newCampaignId}`);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar/>

      <div className="flex-1 bg-gray-50 p-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#096B2E]">All Campaigns</h1>
            <p className="mt-2 text-gray-600">
              View and manage all campaigns in one place.
            </p>
          </div>

          <CampaignsTable initialData={campaigns} />
        </div>
      </div>
    </div>
  );
}