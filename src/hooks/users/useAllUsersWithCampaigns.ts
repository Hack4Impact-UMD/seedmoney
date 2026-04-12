import { useQuery } from "@tanstack/react-query";
import { readAllUsersWithCampaigns } from "@/src/actions/db/users";
import type { Campaign } from "@/src/types/db/campaigns";

export type UserCampaign = Pick<Campaign, "campaign_id" | "name" | "status" | "competition_id">;

export type UsersTableRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  campaigns: UserCampaign[];
};

export default function useAllUsersWithCampaigns() {
  return useQuery<UsersTableRow[]>({
    queryKey: ["all-users-with-campaigns"],
    queryFn: async () => {
      const users = await readAllUsersWithCampaigns();

      return users.map((user) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        campaigns: user.campaign_members.map((m) => ({
          campaign_id: m.campaigns.campaign_id,
          name: m.campaigns.name,
          status: m.campaigns.status as Campaign["status"],
          competition_id: m.campaigns.competition_id,
        })),
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
