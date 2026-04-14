import { useQuery } from "@tanstack/react-query";
import { readAllUsersWithCampaigns } from "@/src/actions/db/users";
import type { UsersTableRow } from "@/src/types/frontend/usersTable";

export default function useAllUsersWithCampaigns() {
  return useQuery<UsersTableRow[]>({
    queryKey: ["campaigns", "all-users-with-campaigns"],
    queryFn: async () => {
      const users = await readAllUsersWithCampaigns();
      if (!users) return [];
      return users;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
