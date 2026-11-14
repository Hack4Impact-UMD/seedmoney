import "server-only";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { readCurrentEmailAudience } from "@/src/lib/readEmailAudience";
import { emailContentErrors, validCampaignUrl, type EmailSendInput } from "@/src/lib/emailSendValidation";
import { fillTextTokens, tokenPattern } from "@/src/components/email/emailTokens";

// Both future delivery entry points must prepare again immediately before queuing.
export async function prepareAdminEmail(input: EmailSendInput) {
  await requireAdmin();
  const errors = emailContentErrors(input);
  if (errors.length) return { success: false as const, errors };
  if (!Number.isSafeInteger(input.competitionId) || !input.competitionId || !["send", "test"].includes(input.mode)) {
    return { success: false as const, errors: ["Reload the current competition and select a valid send mode."] };
  }
  const testEmail = input.mode === "test" ? (typeof input.testEmail === "string" ? input.testEmail.trim() : undefined) : null;
  if (input.mode === "test" && (typeof testEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail))) {
    return { success: false as const, errors: ["Enter a valid test email address."] };
  }
  const audience = await readCurrentEmailAudience(input.recipientGroups);
  if (audience.competitionId !== input.competitionId) errors.push("This draft is not for the current competition. Start a new draft before sending.");
  if (!audience.total) errors.push("Select at least one eligible recipient.");
  const usesCampaignUrl = [...`${input.subject}\n${input.bodyHtml}`.matchAll(tokenPattern())].some(match => match[1] === "campaign_url");
  if (usesCampaignUrl) {
    if (!input.recipientGroups.includes("approved")) errors.push("Select Approved Campaigns to use {{campaign_url}}.");
    if (audience.recipients.some(recipient => !validCampaignUrl(recipient.campaignUrl))) {
      errors.push("Every recipient must have exactly one approved or published campaign with a valid Givebutter URL to use {{campaign_url}}.");
    }
  }
  if (audience.recipients.some(recipient => {
    const subject = fillTextTokens(input.subject, { first_name: recipient.firstName, campaign_url: recipient.campaignUrl ?? "" });
    return !subject.trim() || subject.length > 1000 || /\p{Cc}/u.test(subject);
  })) errors.push("Personalization leaves a recipient's subject empty, too long, or containing control characters.");
  if (errors.length) return { success: false as const, errors };
  return { success: true as const, subject: input.subject, bodyHtml: input.bodyHtml, testEmail,
    competitionId: audience.competitionId, recipients: audience.recipients };
}
