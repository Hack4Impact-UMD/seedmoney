import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendTransferInvitation } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

export default function useResendTransferInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transferId: string) =>
      unwrapActionResult(await resendTransferInvitation(transferId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["account-deletion"] });
    },
  });
}
