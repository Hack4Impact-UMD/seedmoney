"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";
import { reviewApplications } from "@/src/app/dashboard/(admin)/review-applications/mockReviewApplications";

export default function ReviewApplicationsPage() {
  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />

      <main className="flex-1 px-6 py-8 sm:px-10 md:px-12">
        <ReviewApplicationsTable applications={reviewApplications} />
      </main>
    </div>
  );
}
