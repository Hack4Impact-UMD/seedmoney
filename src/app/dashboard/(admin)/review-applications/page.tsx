"use client";

import Navbar from "@/src/components/Navbar";
import ReviewApplicationsTable from "@/src/app/dashboard/(admin)/review-applications/ReviewApplicationsTable";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";

export default function ReviewApplicationsPage() {
  const { data: competition } = useReadCurrentCompetition();

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar/>

      <main className="flex-1 px-6 py-8 sm:px-10 md:px-12">
        <ReviewApplicationsTable competitionId={competition?.competition_id} />
      </main>
    </div>
  );
}
