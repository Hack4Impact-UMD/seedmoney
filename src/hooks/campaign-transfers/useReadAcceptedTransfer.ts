import { useQuery } from "@tanstack/react-query";
import { readAcceptedTransfer } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

export default function useReadAcceptedTransfer(
  campaignId?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["campaign-transfers", "accepted", campaignId],
    queryFn: async () =>
      unwrapActionResult(await readAcceptedTransfer(campaignId!)).transfer,
    enabled: enabled && !!campaignId,
  });
}
