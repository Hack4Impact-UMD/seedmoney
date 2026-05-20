"use client";

import CampaignsTable from "@/src/components/CampaignsTable";
import Navbar from "@/src/components/Navbar";
import { useAuth } from "@/src/context/AuthProvider";
import Error from "@/src/app/error";
import Loading from "@/src/app/loading";
import useReadPreviousChallengeApplications from "@/src/hooks/campaigns/table/useReadPreviousChallengeApplications";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ViewAllCampaignsPage() {
  const router = useRouter();
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

      <div className="flex-1 bg-[#F6FAF9] px-4 py-8 pb-24 md:px-10 md:py-[60px] md:pb-[60px]">
        <div className="flex w-full flex-col gap-6">
          <div className="hidden w-full md:block">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/dashboard")}
              className="!mb-4 !px-0 !text-[18px] !font-bold !uppercase !text-[#6A6A6A]"
            >
              Back
            </Button>
            <h1 className="text-4xl font-bold text-[#096B2E]">All Campaigns</h1>
          </div>

          <CampaignsTable
            initialData={campaigns}
            pageTitle="All Campaigns"
            pageListLabel="Campaign List"
            useFilterMenu
            desktopSearchPlaceholder="Campaign Title, Campaign Leader, etc..."
          />
        </div>
      </div>
    </div>
  );
}
