import { getAudienceStatuses, getCompetitionAudience } from "@/src/lib/competitionAudience";
import { ADMIN_EMAIL_GROUP_LABELS, type AdminEmailGroup } from "@/src/types/db/adminEmails";
import type { UserCampaign, UsersTableRow } from "@/src/types/frontend/usersTable";

export type EmailAudienceCampaign = UserCampaign & { givebutterlink?: string | null };
export type EmailAudienceUser = UsersTableRow & { is_admin: boolean; campaigns: EmailAudienceCampaign[] };
export type EmailRecipient = { userId: string; email: string; firstName: string; campaignId: number | null; campaignUrl: string | null };
export type EmailAudienceSummary = {
  competitionId: number;
  groupCounts: Record<AdminEmailGroup, number>;
  total: number;
  excludedInvalidEmails: number;
};

export function validEmailGroups(value: unknown): value is AdminEmailGroup[] {
  return Array.isArray(value) && value.length <= 4 && value.every(
    group => typeof group === "string" && Object.hasOwn(ADMIN_EMAIL_GROUP_LABELS, group),
  );
}

// Both counts and future sends must resolve through the same membership rules.
export function resolveEmailRecipients(
  users: EmailAudienceUser[], competitionId: number, selectedGroups: AdminEmailGroup[],
): EmailAudienceSummary & { recipients: EmailRecipient[] } {
  if (!Number.isSafeInteger(competitionId) || competitionId <= 0 || !validEmailGroups(selectedGroups)) {
    throw new Error("Invalid email audience selection.");
  }
  const groups = Object.keys(ADMIN_EMAIL_GROUP_LABELS) as AdminEmailGroup[];
  const byGroup = Object.fromEntries(groups.map(group => [group, new Map<string, EmailRecipient>()])) as
    Record<AdminEmailGroup, Map<string, EmailRecipient>>;
  const selected = new Map<string, EmailRecipient>();
  let excludedInvalidEmails = 0;
  const audience = getCompetitionAudience(users.filter(user => !user.is_admin), competitionId);

  for (const user of [...audience].sort((a, b) => a.id.localeCompare(b.id))) {
    const email = user.email?.trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { excludedInvalidEmails++; continue; }
    const statuses = getAudienceStatuses(user);
    const memberships: AdminEmailGroup[] = ["all"];
    if (statuses.includes("not_started")) memberships.push("not_started");
    if (statuses.includes("in_progress")) memberships.push("unfinished");
    if (statuses.includes("approved") || statuses.includes("published")) memberships.push("approved");
    const approved = new Map((user.campaigns as EmailAudienceCampaign[])
      .filter(campaign => campaign.status === "approved" || campaign.status === "published")
      .map(campaign => [campaign.campaign_id, campaign]));
    const campaign = approved.size === 1 ? [...approved.values()][0] : null;
    const recipient = { userId: user.id, email, firstName: user.first_name ?? "",
      campaignId: campaign?.campaign_id ?? null, campaignUrl: campaign?.givebutterlink?.trim() || null };
    const emailKey = email.toLowerCase();
    for (const group of memberships) {
      if (!byGroup[group].has(emailKey)) byGroup[group].set(emailKey, recipient);
    }
    if (memberships.some(group => selectedGroups.includes(group)) && !selected.has(emailKey)) {
      selected.set(emailKey, recipient);
    }
  }
  return {
    competitionId, groupCounts: Object.fromEntries(groups.map(group => [group, byGroup[group].size])) as Record<AdminEmailGroup, number>,
    total: selected.size, excludedInvalidEmails, recipients: [...selected.values()],
  };
}
