import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptTransfer } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

// Resolves with the database result code; only "accepted" changes ownership.
export default function useAcceptTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) =>
      unwrapActionResult(await acceptTransfer(token)),
    onSuccess: ({ result }) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-transfers"] });

      if (result === "accepted") {
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes("campaigns"),
        });
      }
    },
  });
}
