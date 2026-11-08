 // Sends campaign transfer emails. Kept separate from send-campaign-email,
// whose source isn't in this repo.
//
// Called only from the app server with the service role key, because the
// invitation email contains a link supplied by the caller.
//
// Without BREVO_API_KEY (e.g. local development) the email is logged instead
// of sent.

import { createClient } from "jsr:@supabase/supabase-js@2";

type EmailType = "transfer_invitation" | "transfer_completed";

type UserName = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

type TransferRow = {
  transfer_id: string;
  recipient_email: string;
  expires_at: string;
  campaigns: { name: string | null } | null;
  inviter: UserName | null;
  recipient: UserName | null;
};

const VALID_TYPES: EmailType[] = ["transfer_invitation", "transfer_completed"];

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatName(user: UserName | null) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Email = {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
};

// An invitation goes to the recipient; a completed transfer notifies both the
// previous owner and the new owner.
function buildEmails(
  type: EmailType,
  transfer: TransferRow,
  acceptUrl: string,
): Email[] {
  const campaignName = escapeHtml(transfer.campaigns?.name ?? "a campaign");
  const inviterName = escapeHtml(
    formatName(transfer.inviter) || "A SeedMoney campaign leader",
  );

  if (type === "transfer_invitation") {
    const safeUrl = escapeHtml(acceptUrl);
    const recipientEmail = escapeHtml(transfer.recipient_email);

    return [{
      to: { email: transfer.recipient_email },
      subject: `You've been invited to lead "${transfer.campaigns?.name ?? "a campaign"}" on SeedMoney`,
      htmlContent: `
        <p>Hi,</p>
        <p>${inviterName} has invited you to take over <strong>${campaignName}</strong> as campaign leader on SeedMoney.</p>
        <p><a href="${safeUrl}">Accept the transfer</a></p>
        <p>You'll need to be signed in to SeedMoney as ${recipientEmail}. If you don't have an account yet, sign up with that email first, then open this link again.</p>
        <p>This invitation expires on ${formatDate(transfer.expires_at)}.</p>
        <p>If you weren't expecting this, you can ignore this email.</p>
      `,
    }];
  }

  const recipientName = escapeHtml(
    formatName(transfer.recipient) || transfer.recipient_email,
  );

  const previousOwnerEmail: Email = {
    to: {
      email: transfer.inviter?.email ?? "",
      name: formatName(transfer.inviter) || undefined,
    },
    subject: `Your SeedMoney campaign "${transfer.campaigns?.name ?? ""}" has been transferred`,
    htmlContent: `
      <p>Hi ${escapeHtml(transfer.inviter?.first_name ?? "there")},</p>
      <p>${recipientName} accepted your invitation and is now the campaign leader of <strong>${campaignName}</strong>.</p>
      <p>You no longer have access to this campaign. If this looks wrong, contact roger@seedmoney.org.</p>
    `,
  };

  const newOwnerEmail: Email = {
    to: {
      email: transfer.recipient?.email ?? transfer.recipient_email,
      name: formatName(transfer.recipient) || undefined,
    },
    subject: `You're now leading "${transfer.campaigns?.name ?? "a campaign"}" on SeedMoney`,
    htmlContent: `
      <p>Hi ${escapeHtml(transfer.recipient?.first_name ?? "there")},</p>
      <p>${inviterName} transferred <strong>${campaignName}</strong> to you, and you're now its campaign leader. Everything stays as it was: the campaign page, its donations so far, and its standing in the challenge.</p>
      <p>You can now see donations and analytics, get an email for every new donation, and share the campaign link and QR code from your SeedMoney dashboard.</p>
      <p>Something look wrong? Contact roger@seedmoney.org.</p>
    `,
  };

  return [previousOwnerEmail, newOwnerEmail];
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Missing required environment variables" }, 500);
    }

    if (req.headers.get("Authorization") !== `Bearer ${serviceRoleKey}`) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const type = body.type as EmailType;
    const transferId = body.transfer?.transfer_id;
    const acceptUrl = body.transfer?.accept_url ?? "";

    if (!VALID_TYPES.includes(type) || typeof transferId !== "string") {
      return json({ error: "Missing or invalid type or transfer_id" }, 400);
    }

    if (type === "transfer_invitation" && !acceptUrl) {
      return json({ error: "Missing accept_url" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: transfer, error } = await supabase
      .from("campaign_transfers")
      .select(
        `transfer_id, recipient_email, expires_at,
        campaigns(name),
        inviter:users!campaign_transfers_inviter_id_fkey(first_name, last_name, email),
        recipient:users!campaign_transfers_accepted_by_fkey(first_name, last_name, email)`,
      )
      .eq("transfer_id", transferId)
      .single<TransferRow>();

    if (error || !transfer) {
      return json({ error: "Transfer not found" }, 404);
    }

    const emails = buildEmails(type, transfer, acceptUrl).filter(
      (email) => email.to.email,
    );

    if (emails.length === 0) {
      return json({ error: "Recipient email not found" }, 404);
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");

    if (!brevoApiKey) {
      for (const email of emails) {
        console.log("BREVO_API_KEY not set; email not sent:", JSON.stringify(email));
      }
      if (acceptUrl) console.log("Accept link:", acceptUrl);
      return json({ ok: true, sent: false });
    }

    for (const email of emails) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            email: Deno.env.get("EMAIL_FROM") ?? "challenge@seedmoney.org",
            name: Deno.env.get("EMAIL_FROM_NAME") ?? "SeedMoney",
          },
          to: [email.to],
          subject: email.subject,
          htmlContent: email.htmlContent,
        }),
      });

      if (!response.ok) {
        console.error("Brevo email error:", await response.text());
        return json({ error: "Failed to send email" }, 502);
      }
    }

    return json({ ok: true, sent: true });
  } catch (error) {
    console.error("send-transfer-email error:", error);
    return json({ error: "Unexpected error" }, 500);
  }
});
