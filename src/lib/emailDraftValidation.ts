import { ADMIN_EMAIL_GROUP_LABELS, type EmailDraftValues } from "@/src/types/db/adminEmails";

export function emailDraftValuesError(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Invalid draft fields.";
  const fields = value as Partial<EmailDraftValues>;
  if (typeof fields.subject !== "string" || fields.subject.length > 1000 ||
    typeof fields.bodyHtml !== "string" || fields.bodyHtml.length > 500_000 ||
    new TextEncoder().encode(fields.bodyHtml).length > 500_000 ||
    !Array.isArray(fields.recipientGroups) || fields.recipientGroups.length > 4 ||
    !fields.recipientGroups.every(group => typeof group === "string" && Object.hasOwn(ADMIN_EMAIL_GROUP_LABELS, group))) {
    return "The draft contains invalid or oversized fields. Please shorten it or check the recipient groups.";
  }
  return null;
}
