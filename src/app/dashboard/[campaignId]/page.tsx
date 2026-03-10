"use client";

import { useParams } from "next/navigation";
import { getCampaignById } from "../sampleCampaigns";
import NotComplete from "@/src/components/dashboard/NotComplete";
import Pending from "@/src/components/dashboard/Pending";

export default function CampaignOverviewPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaign = getCampaignById(Number(campaignId));

  const handleContinueApplication = () => {
    // TODO: navigate to the application flow for this campaign
    console.log("Continue application for campaign:", campaignId);
  };

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.status === "in_progress") {
    return <NotComplete onContinueApplication={handleContinueApplication} />;
  }

  if (campaign.status === "submitted_under_review") {
    return <Pending />;
  }

  return <h1>Home</h1>;
}
