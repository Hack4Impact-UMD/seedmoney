import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendTransferInvitation } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

export default function useSendTransferInvitation(campaignId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientEmail: string) =>
      unwrapActionResult(
        await sendTransferInvitation(campaignId, recipientEmail),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["account-deletion"] });
    },
  });
}
