import { useQuery } from "@tanstack/react-query";
import { readUser } from "@/src/actions/db/users";
import { Users } from "@/src/types/db/users";

export default function useUserByAuthId(userId: string) {
    return useQuery<Users>({
        queryKey: [userId, 'user'],
        queryFn: async () =>  {
          const user = await readUser(userId);
          if (!user) throw new Error("User not found");
          return user;
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!userId
    });
}