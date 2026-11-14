"use server";

import { prepareAdminEmail } from "@/src/lib/prepareAdminEmail";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { EXAMPLE_TOKEN_VALUES, fillEmailTokens, fillTextTokens } from "@/src/components/email/emailTokens";
import type { EmailSendInput } from "@/src/lib/emailSendValidation";

export type TestEmailResult = { success: true; testEmail: string } |
  { success: false; errors: string[]; uncertain?: boolean };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uncertain = (): TestEmailResult => ({ success: false, uncertain: true,
  errors: ["The test email's acceptance is uncertain. Check your inbox or provider logs before trying again."] });

export async function sendAdminTestEmail(input: EmailSendInput & { requestId: string }): Promise<TestEmailResult> {
  let invoked = false;
  try {
    // Revalidate here; a successful preview is not permission to send arbitrary HTML.
    const prepared = await prepareAdminEmail({ ...input, mode: "test" });
    if (!prepared.success) return prepared;
    if (!prepared.testEmail || typeof input.requestId !== "string" || !UUID.test(input.requestId)) {
      return { success: false, errors: ["Enter a valid test address and start a new test request."] };
    }
    const subject = fillTextTokens(prepared.subject, EXAMPLE_TOKEN_VALUES);
    const body = fillEmailTokens(prepared.bodyHtml, EXAMPLE_TOKEN_VALUES);
    if (subject.length > 1000 || new TextEncoder().encode(body).length > 500_000) {
      return { success: false, errors: ["Example personalization makes the test email too long. Shorten the subject or message."] };
    }
    const supabase = createServiceRoleClient();
    invoked = true;
    const { data, error } = await supabase.functions.invoke("send-admin-email", {
      body: { mode: "test", request_id: input.requestId, recipient_email: prepared.testEmail, subject, body_html: body },
      timeout: 15_000,
    });
    if (error) {
      if ([400, 404, 405, 409].includes(error.context?.status)) {
        return { success: false, errors: ["Test sending is unavailable. Update the send-admin-email Edge Function in this Supabase project first."] };
      }
      if ([401, 403].includes(error.context?.status)) {
        return { success: false, errors: ["The test sender refused authorization. Check the app's Supabase service-role configuration."] };
      }
      return uncertain();
    }
    if (!data || data.test !== true || data.request_id !== input.requestId) return uncertain();
    if (data.accepted === true) return { success: true, testEmail: prepared.testEmail };
    if (data.code === "rate_limited") return { success: false, errors: ["The email provider rate-limited this test. Wait before trying again."] };
    if (data.code === "rejected") return { success: false, errors: ["The email provider rejected this test. Check the test address, sender, and Brevo configuration."] };
    return uncertain();
  } catch (error) {
    console.error("Unable to send admin test email:", error);
    return invoked ? uncertain() : { success: false, errors: ["Unable to prepare the test email. Check your connection and server configuration, then retry."] };
  }
}
