import type { Status } from "@/src/types/db/enums";
import type { UsersTableRow } from "@/src/types/frontend/usersTable";

export type AudienceStatus = Status | "not_started";

export function getCompetitionAudience(
  users: UsersTableRow[],
  competitionId: number | null,
  archiveApproved = false,
): UsersTableRow[] {
  return users.map((user) => ({
    ...user,
    campaigns: user.campaigns
      .filter((campaign) => campaign.competition_id === competitionId)
      .map((campaign) => ({
        ...campaign,
        status:
          archiveApproved && campaign.status === "approved"
            ? "archived"
            : campaign.status,
      })),
  }));
}

export function getAudienceStatuses(
  user: UsersTableRow,
): AudienceStatus[] {
  if (user.campaigns.length === 0) {
    return ["not_started"];
  }

  return Array.from(new Set(user.campaigns.map((campaign) => campaign.status)));
}

export function matchesAudienceStatus(
  user: UsersTableRow,
  status: AudienceStatus,
): boolean {
  return getAudienceStatuses(user).includes(status);
}

export function countAudienceByStatus(
  users: UsersTableRow[],
): Record<AudienceStatus, number> {
  const statuses: AudienceStatus[] = [
    "not_started",
    "in_progress",
    "pending",
    "approved",
    "denied",
    "published",
    "publish_failed",
    "archived",
  ];

  return Object.fromEntries(
    statuses.map((status) => [
      status,
      users.filter((user) => matchesAudienceStatus(user, status)).length,
    ]),
  ) as Record<AudienceStatus, number>;
}
