"use server";

import { readCurrentEmailAudience } from "@/src/lib/readEmailAudience";
import type { EmailAudienceSummary } from "@/src/lib/emailRecipients";
import type { AdminEmailGroup } from "@/src/types/db/adminEmails";

export async function readEmailAudienceSummary(groups: AdminEmailGroup[]): Promise<
  { success: true; summary: EmailAudienceSummary } | { success: false; error: string }
> {
  try {
    const { competitionId, groupCounts, total, excludedInvalidEmails } = await readCurrentEmailAudience(groups);
    return { success: true, summary: { competitionId, groupCounts, total, excludedInvalidEmails } };
  } catch (error) {
    console.error("Unable to resolve admin email audience:", error);
    return { success: false, error: "Unable to load recipients. Check that a current competition is configured and retry." };
  }
}
