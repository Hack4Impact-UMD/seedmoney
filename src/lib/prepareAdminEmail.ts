import "server-only";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { readCurrentEmailAudience } from "@/src/lib/readEmailAudience";
import { emailContentErrors, validCampaignUrl, type EmailSendInput } from "@/src/lib/emailSendValidation";
import { fillEmailTokens, fillTextTokens, tokenPattern } from "@/src/components/email/emailTokens";
import type { EmailRecipient } from "@/src/lib/emailRecipients";

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
  // Test sends use example values, never the selected audience's private data.
  if (input.mode === "test") return { success: true as const, subject: input.subject, bodyHtml: input.bodyHtml,
    testEmail, competitionId: input.competitionId, recipients: [] as EmailRecipient[] };
  const audience = await readCurrentEmailAudience(input.recipientGroups);
  if (audience.competitionId !== input.competitionId) errors.push("This draft is not for the current competition. Start a new draft before sending.");
  if (!audience.total) errors.push("Select at least one eligible recipient.");
  const usesCampaignUrl = [...`${input.subject}\n${input.bodyHtml}`.matchAll(tokenPattern())].some(match => match[1] === "campaign_url");
  if (usesCampaignUrl) {
    if (!input.recipientGroups.includes("approved")) errors.push("Select Approved Campaigns to use {{campaign_url}}.");
    if (audience.recipients.some(recipient => !recipient.campaignLinks.length ||
      recipient.campaignLinks.some(link => !validCampaignUrl(link.url)))) {
      errors.push("Every recipient must have at least one approved or published campaign, and every campaign must have a valid Givebutter URL to use {{campaign_url}}.");
    }
  }
  if (audience.recipients.some(recipient => {
    const subject = fillTextTokens(input.subject, { first_name: recipient.firstName, campaign_links: recipient.campaignLinks });
    return !subject.trim() || subject.length > 1000 || /\p{Cc}/u.test(subject);
  })) errors.push("Personalization leaves a recipient's subject empty, too long, or containing control characters.");
  if (audience.recipients.some(recipient => new TextEncoder().encode(fillEmailTokens(input.bodyHtml, {
    first_name: recipient.firstName, campaign_links: recipient.campaignLinks,
  })).length > 500_000)) errors.push("Personalization makes a recipient's message too long. Shorten the message before sending.");
  if (errors.length) return { success: false as const, errors };
  return { success: true as const, subject: input.subject, bodyHtml: input.bodyHtml, testEmail,
    competitionId: audience.competitionId, recipients: audience.recipients };
}
