import { useQuery } from "@tanstack/react-query";
import { readTransactionsByCampaign } from "@/src/actions/db/transactions";
import type { Transaction } from "@/src/types/db/transactions";

export default function useReadCampaignTransactions(campaignId: number) {
  return useQuery<Transaction[]>({
    queryKey: [campaignId, "transactions", "read"],
    queryFn: async () => {
      const txns = await readTransactionsByCampaign(campaignId);
      if (!txns) throw new Error("Error reading transactions");
      return txns;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!campaignId,
  });
}
