"use client";

import { SubmitEventHandler } from "react";
import InformationSection from "@/src/components/dashboard/InformationSection";

export default function CampaignOverviewPage() {
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <>
      <InformationSection />
    </>
  );
}
