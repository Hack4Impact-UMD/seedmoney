import { readCampaign, readCampaignsByTitle } from "@/src/actions/db/campaigns";
import CampaignsTable from "@/src/components/CampaignsTable";

export default async function ViewAllCampaignsPage({ searchParams, }: { searchParams: Promise<{ query?: string }>; }) {
  const query = (await searchParams).query;

  const data = query ? await readCampaignsByTitle(query) : await readCampaign();

  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

  const serializedData = JSON.parse(
    JSON.stringify(normalizedData, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f2faf9]">
      <CampaignsTable initialData={serializedData}/>
    </main>
  );
}