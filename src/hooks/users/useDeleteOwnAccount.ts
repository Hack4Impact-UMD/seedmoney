import { useMutation } from "@tanstack/react-query";
import { deleteOwnAccount } from "@/src/actions/db/account-deletion";
import type { DeleteOwnAccountResult } from "@/src/types/accountDeletion";

export default function useDeleteOwnAccount() {
  return useMutation<DeleteOwnAccountResult, Error, void>({
    mutationFn: deleteOwnAccount,
    retry: false,
  });
}