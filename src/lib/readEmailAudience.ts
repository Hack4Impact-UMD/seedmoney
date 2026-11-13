import "server-only";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { fetchAllPages } from "@/src/lib/fetchAllPages";
import { resolveEmailRecipients, validEmailGroups } from "@/src/lib/emailRecipients";
import type { AdminEmailGroup } from "@/src/types/db/adminEmails";
import type { Users } from "@/src/types/db/users";
import type { UserCampaign } from "@/src/types/frontend/usersTable";

type AudienceAccount = Pick<Users, "id" | "email" | "first_name" | "last_name" | "is_admin">;
type LeaderMembership = { user_id: string; role: string; campaigns: UserCampaign | null };

// Future sends must call this again, not trust counts or recipients from the browser.
export async function readCurrentEmailAudience(groups: AdminEmailGroup[]) {
  await requireAdmin();
  if (!validEmailGroups(groups)) throw new Error("Invalid recipient groups.");
  const supabase = createServiceRoleClient();
  const { data: competition, error } = await supabase.from("competition_metadata")
    .select("competition_id").eq("is_current", true).maybeSingle();
  if (error) throw error;
  if (!competition) throw new Error("No current competition is configured.");

  const users = await fetchAllPages<AudienceAccount>((from, to) => supabase.from("users")
    .select("id, email, first_name, last_name, is_admin", { count: "exact" })
    .eq("is_admin", false).order("id").range(from, to));
  const members = await fetchAllPages<LeaderMembership>((from, to) => supabase.from("campaign_members")
    .select("user_id, role, campaigns!inner(campaign_id, name, status, competition_id)", { count: "exact" })
    .eq("role", "campaign_leader").eq("campaigns.competition_id", competition.competition_id)
    .order("user_id").order("campaign_id").range(from, to));
  const campaignsByUser = new Map<string, UserCampaign[]>();
  for (const member of members) {
    if (member.role !== "campaign_leader" || !member.campaigns) continue;
    const campaigns = campaignsByUser.get(member.user_id) ?? [];
    campaigns.push(member.campaigns);
    campaignsByUser.set(member.user_id, campaigns);
  }
  return resolveEmailRecipients(users.map(user => ({ ...user, campaigns: campaignsByUser.get(user.id) ?? [] })),
    competition.competition_id, groups);
}
