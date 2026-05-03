import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/src/actions/db/users";

export default function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "all-users-with-campaigns"],
      });
    },
  });
}
