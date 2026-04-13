import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/src/actions/db/users";
import { Users } from "@/src/types/db/users";

export default function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    Users,
    Error,
    { userId: string; userData: Partial<Users> }
  >({
    mutationFn: async ({ userId, userData }) => {
      const campaign = await updateUser(userId, userData);
      if (!campaign) throw new Error("Error updating user");
      return campaign;
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: [userId, "user"],
      });
    },
  });
}
