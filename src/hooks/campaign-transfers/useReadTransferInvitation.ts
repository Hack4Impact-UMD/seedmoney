import { useQuery } from "@tanstack/react-query";
import { getTransferInvitation } from "@/src/actions/db/campaign-transfers";
import { unwrapActionResult } from "@/src/lib/utils/actionResult";

export default function useReadTransferInvitation(token?: string) {
  return useQuery({
    queryKey: ["campaign-transfers", "invitation", token],
    queryFn: async () =>
      unwrapActionResult(await getTransferInvitation(token!)).invitation,
    enabled: !!token,
    retry: false,
  });
}
