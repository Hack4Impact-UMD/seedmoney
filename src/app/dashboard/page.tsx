import { redirect } from "next/navigation";
import { sampleCampaigns } from "./sampleCampaigns";

export default function DashboardIndexPage() {
  redirect(`/dashboard/${sampleCampaigns[0].id}`);
}
