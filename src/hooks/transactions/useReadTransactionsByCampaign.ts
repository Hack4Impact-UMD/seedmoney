import { useQuery } from "@tanstack/react-query";
import { readTransactionsByCampaign } from "@/src/actions/db/transactions";
import { Transaction } from "@/src/types/db/transactions";

export default function useReadTransactionsByCampaign(campaignId: number) {
  return useQuery<Transaction[]>({
    queryKey: [campaignId, "transactions", "read"],
    queryFn: async () => {
      const transactions = await readTransactionsByCampaign(campaignId);
      if (!transactions) throw new Error("Error reading transactions");
      return transactions;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!campaignId,
  });
}
