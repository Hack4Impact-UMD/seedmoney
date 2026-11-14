"use server";

import { prepareAdminEmail } from "@/src/lib/prepareAdminEmail";
import type { EmailSendInput, EmailSendValidationResult } from "@/src/lib/emailSendValidation";

export async function validateEmailForSend(input: EmailSendInput): Promise<EmailSendValidationResult> {
  try {
    const result = await prepareAdminEmail(input);
    if (!result.success) return result;
    return { success: true, recipientCount: result.recipients.length };
  } catch (error) {
    console.error("Unable to validate admin email:", error);
    return { success: false, errors: ["Unable to validate this email. Please retry before sending."] };
  }
}
