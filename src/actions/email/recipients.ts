"use server";

import { readCurrentEmailAudience } from "@/src/lib/readEmailAudience";
import type { EmailAudienceSummary } from "@/src/lib/emailRecipients";
import type { AdminEmailGroup } from "@/src/types/db/adminEmails";

export async function readEmailAudienceSummary(groups: AdminEmailGroup[]): Promise<
  { success: true; summary: EmailAudienceSummary } | { success: false; error: string }
> {
  try {
    const { competitionId, groupCounts, total, excludedInvalidEmails, missingFirstNames } = await readCurrentEmailAudience(groups);
    return { success: true, summary: { competitionId, groupCounts, total, excludedInvalidEmails, missingFirstNames } };
  } catch (error) {
    console.error("Unable to resolve admin email audience:", error);
    return { success: false, error: "Unable to load recipients. Check that a current competition is configured and retry." };
  }
}

export type EmailAudienceRecipient = { email: string; firstName: string };

// Admin-only list behind the "View" button. The summary above stays address-free.
export async function readEmailAudienceRecipients(groups: AdminEmailGroup[]): Promise<
  { success: true; recipients: EmailAudienceRecipient[] } | { success: false; error: string }
> {
  try {
    const { recipients } = await readCurrentEmailAudience(groups);
    return {
      success: true,
      recipients: recipients
        .map(({ email, firstName }) => ({ email, firstName }))
        .sort((a, b) => a.email.localeCompare(b.email)),
    };
  } catch (error) {
    console.error("Unable to list admin email recipients:", error);
    return { success: false, error: "Unable to load recipients. Please retry." };
  }
}
