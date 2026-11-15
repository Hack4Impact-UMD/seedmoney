import { useQuery } from "@tanstack/react-query";
import { readActiveCampaignTransfer } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

export default function useReadActiveCampaignTransfer(campaignId?: number) {
  return useQuery({
    queryKey: ["campaign-transfers", campaignId],
    queryFn: async () =>
      unwrapActionResult(await readActiveCampaignTransfer(campaignId!))
        .transfer,
    enabled: !!campaignId,
  });
}
