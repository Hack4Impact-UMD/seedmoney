import type { Status } from "@/src/types/db/enums";



const statusLabels: Partial<Record<Status, string>> = {
  in_progress: "Draft",
  publish_failed: "Publish Failed",
  pending: "Pending",
  on_hold: "On Hold",
  approved: "Approved",
  denied: "Denied",
  published: "Published",
  suspended: "Suspended",
  archived: "Archived",
};

export function getStatusLabel(status: string) {
  return statusLabels[status as Status] ?? status;
}

// On hold is an internal admin state; applicants see it as pending.
export function isUnderReview(status: string | null | undefined) {
  return status === "pending" || status === "on_hold";
}

export function toApplicantStatus<T extends string>(status: T): T | "pending" {
  return status === "on_hold" ? "pending" : status;
}
