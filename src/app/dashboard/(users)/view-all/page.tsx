"use client";

import CampaignsTable from "@/src/components/CampaignsTable";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";
import Error from "@/src/app/error";
import Loading from "@/src/app/loading";
import useReadPreviousChallengeApplications from "@/src/hooks/campaigns/table/useReadPreviousChallengeApplications";

export default function ViewAllCampaignsPage() {
  const { user } = useAuth();
  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useReadPreviousChallengeApplications(user?.id);

  if (isLoading) return <Loading />;

  if (error) return <Error error={error} reset={() => {}} />;

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1 bg-[#F6FAF9] px-10 py-[60px]">
        <div className="flex w-full flex-col gap-6">
          <div className="w-full">
            <h1 className="text-4xl font-bold text-[#096B2E]">All Campaigns</h1>
          </div>

          <CampaignsTable initialData={campaigns} isAdmin/>
        </div>
      </div>
    </div>
  );
}
