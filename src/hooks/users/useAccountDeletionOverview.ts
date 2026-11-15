import { useQuery } from "@tanstack/react-query";
import { getAccountDeletionOverview } from "@/src/actions/db/account-deletion";
import type { AccountDeletionOverview } from "@/src/types/accountDeletion";

export default function useAccountDeletionOverview(enabled: boolean) {
  return useQuery<AccountDeletionOverview>({
    queryKey: ["account-deletion", "overview"],
    queryFn: getAccountDeletionOverview,
    enabled,
    retry: 1,
    staleTime: 0,
  });
}