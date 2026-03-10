import DonorsTable from "../../../../components/DonorsTable";

interface CampaignDonorsPageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default async function CampaignDonorsPage({
  params,
}: CampaignDonorsPageProps) {
  const { campaignId } = await params;

  return (
    <>
      <h1>Donors</h1>
      <DonorsTable campaignId={Number(campaignId)} />
    </>
  );
}
