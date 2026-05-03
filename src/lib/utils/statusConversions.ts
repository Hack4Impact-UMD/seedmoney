import type { Status } from "@/src/types/db/enums";



const statusLabels: Partial<Record<Status, string>> = {
  in_progress: "Draft",
  publish_failed: "Publish Failed",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  published: "Published",
  archived: "Archived",
};

export function getStatusLabel(status: string) {
  return statusLabels[status as Status] ?? status;
}
