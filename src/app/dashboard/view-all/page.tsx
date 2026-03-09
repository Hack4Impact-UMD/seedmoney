import { readCampaign, readCampaignsByTitle } from "@/src/actions/db/campaigns";
import CampaignsTable from "@/src/components/CampaignsTable";

export default async function ViewAllCampaignsPage({ searchParams, }: { searchParams: Promise<{ query?: string }>; }) {
  // whitespaces queries end up as "query=++++++" so trimming whitespaces before is pointless since it isn't white space
  const query = (await searchParams).query;

  const data = query ? await readCampaignsByTitle(query) : await readCampaign();

  const normalizedData = Array.isArray(data) ? data : data ? [data] : [];
  type NormalizedCampaign = (typeof normalizedData)[number];
  type SerializedCampaign = Omit<NormalizedCampaign, "goal" | "raised"> & {
    goal?: string | number | null;
    raised?: string | number | null;
  };

  const rawSerializedData: SerializedCampaign[] = JSON.parse(
    JSON.stringify(normalizedData, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const serializedData = rawSerializedData.map((campaign) => ({
    ...campaign,
    goal: Number(campaign.goal ?? 0),
    raised: Number(campaign.raised ?? 0),
  }));

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f2faf9]">
      <CampaignsTable initialData={serializedData}/>
    </main>
  );
}