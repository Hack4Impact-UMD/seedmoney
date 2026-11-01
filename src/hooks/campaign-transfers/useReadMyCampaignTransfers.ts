import { useQuery } from "@tanstack/react-query";
import { readMyCampaignTransfers } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

// The signed-in user's latest pending, expired, or accepted transfer per campaign.
export default function useReadMyCampaignTransfers() {
  return useQuery({
    queryKey: ["campaign-transfers", "mine"],
    queryFn: async () =>
      unwrapActionResult(await readMyCampaignTransfers()).transfers,
  });
}
