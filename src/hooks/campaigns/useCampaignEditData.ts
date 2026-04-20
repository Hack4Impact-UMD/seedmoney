import { useQuery } from "@tanstack/react-query";
import { readCampaignEditInformation } from "@/src/actions/frontend/campaignsEdit";
import { EditCampaignFormData } from "@/src/types/frontend/campaignEdit";


type CampaignEditData = Awaited<ReturnType<typeof readCampaignEditInformation>>;

export function useCampaignEditData(campaignId: number) {
  return useQuery<CampaignEditData>({
    queryKey: ["campaigns", "read", campaignId],
    queryFn: async () => {
      const data = await readCampaignEditInformation(campaignId);
      if (!data) throw new Error("No data returned");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!campaignId,
  });
}