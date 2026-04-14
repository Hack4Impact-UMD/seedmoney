import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/src/actions/db/users";
import { Users } from "@/src/types/db/users";

export default function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    Users,
    Error,
    { userId: string; userUpdateData: Partial<Users> }
  >({
    mutationFn: async ({ userId, userUpdateData }) => {
      const user = await updateUser(userId, userUpdateData);
      if (!user) throw new Error("Error updating user");
      return user;
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: [userId, "user"],
      });
    },
  });
}
