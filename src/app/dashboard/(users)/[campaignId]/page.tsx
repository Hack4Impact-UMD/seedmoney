"use client";

import { useParams } from "next/navigation";
import DonorsTable from "@/src/components/DonorsTable";
import CampaignAnalyticsSection from "@/src/components/dashboard/CampaignAnalyticsSection";
import InformationSection from "@/src/components/dashboard/InformationSection";

export default function CampaignOverviewPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const parsedCampaignId = Number(campaignId);

  return (
    <>
      <section id="dashboard-donations" className="scroll-mt-20">
        <DonorsTable campaignId={parsedCampaignId} />
      </section>

      <section id="dashboard-analytics" className="scroll-mt-20">
        <CampaignAnalyticsSection campaignId={parsedCampaignId} />
      </section>

      <section id="dashboard-help" className="scroll-mt-20">
        <InformationSection />
      </section>
    </>
  );
}
