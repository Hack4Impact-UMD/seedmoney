import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type EmailType =
  | "campaign_submitted"
  | "campaign_approved"
  | "campaign_denied"
  | "draft_saved"
  | "campaign_live"
  | "donation_received";

type Campaign = {
  campaign_id: number;
  name: string | null;
  goal: number | null;
  givebutterlink: string | null;
  contact_email: string | null;
};

type CampaignLeader = {
  user_id: string;
};

type UserInfo = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
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

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function getDisplayName(user: UserInfo) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || "there";
}

function getCampaignUrl(campaign: Campaign, dashboardUrl: string) {
  if (campaign.givebutterlink) return campaign.givebutterlink;
  if (!dashboardUrl) return "";
  return `${dashboardUrl.replace(/\/$/, "")}/dashboard/${campaign.campaign_id}`;
}

function buildEmail({
  type,
  campaign,
  user,
  dashboardUrl,
  grantInfoUrl,
}: {
  type: EmailType;
  campaign: Campaign;
  user: UserInfo;
  dashboardUrl: string;
  grantInfoUrl: string;
}) {
  const firstName = escapeHtml(getDisplayName(user));
  const campaignName = escapeHtml(campaign.name ?? "your campaign");
  const goal = formatCurrency(campaign.goal);
  const campaignUrl = getCampaignUrl(campaign, dashboardUrl);
  const safeCampaignUrl = campaignUrl ? escapeHtml(campaignUrl) : "";
  const safeGrantInfoUrl = grantInfoUrl ? escapeHtml(grantInfoUrl) : "";

  const links = [
    safeCampaignUrl
      ? `<p><a href="${safeCampaignUrl}">Open your campaign dashboard</a></p>`
      : "",
    safeGrantInfoUrl
      ? `<p><a href="${safeGrantInfoUrl}">Review matching grant information</a></p>`
      : "",
  ].join("");

  switch (type) {
    case "draft_saved":
      return {
        subject: "Your SeedMoney application draft has been saved",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p>Your SeedMoney Challenge application draft for <strong>${campaignName}</strong> has been saved.</p>
          <p>You can return any time to complete and submit it.</p>
          ${links}
        `,
      };
    case "campaign_submitted":
      return {
        subject: "Your SeedMoney application has been submitted",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p>Your application for <strong>${campaignName}</strong> has been submitted for review.</p>
          <p>We will email you when the review is complete.</p>
          ${links}
        `,
      };
    case "campaign_approved":
      return {
        subject: "Your SeedMoney campaign has been approved",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p>Your SeedMoney campaign, <strong>${campaignName}</strong>, has been approved.</p>
          <p>Your fundraising goal is ${goal}.</p>
          ${links}
        `,
      };
    case "campaign_denied":
      return {
        subject: "Update on your SeedMoney application",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p>Thank you for applying to the SeedMoney Challenge with <strong>${campaignName}</strong>.</p>
          <p>After review, this application was not approved for the current Challenge.</p>
        `,
      };
    case "campaign_live":
      return {
        subject: "Your SeedMoney campaign is live",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p>Your campaign, <strong>${campaignName}</strong>, is now live.</p>
          ${links}
        `,
      };
    case "donation_received":
      return {
        subject: "Your SeedMoney campaign received a donation",
        htmlContent: `
          <p>Hi ${firstName},</p>
          <p><strong>${campaignName}</strong> just received a donation.</p>
          ${links}
        `,
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const body = await req.json();
    const type = body.type as EmailType;
    const campaignId = Number(body.campaign_id);

    const validTypes: EmailType[] = [
      "campaign_submitted",
      "campaign_approved",
      "campaign_denied",
      "draft_saved",
      "campaign_live",
      "donation_received",
    ];

    if (!validTypes.includes(type) || !Number.isFinite(campaignId)) {
      return json({ error: "Missing or invalid type or campaign_id" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !brevoApiKey) {
      return json({ error: "Missing required environment variables" }, 500);
    }

    const fromEmail = Deno.env.get("EMAIL_FROM") ?? "challenge@seedmoney.org";
    const fromName = Deno.env.get("EMAIL_FROM_NAME") ?? "SeedMoney";
    const denialReplyTo = Deno.env.get("DENIAL_REPLY_TO") ?? "roger@seedmoney.org";
    const dashboardUrl = Deno.env.get("DASHBOARD_URL") ?? "";
    const grantInfoUrl = Deno.env.get("GRANT_INFO_URL") ?? "";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("campaign_id, name, goal, givebutterlink, contact_email")
      .eq("campaign_id", campaignId)
      .single<Campaign>();

    if (campaignError || !campaign) {
      return json({ error: "Campaign not found" }, 404);
    }

    const { data: leader, error: leaderError } = await supabase
      .from("campaign_members")
      .select("user_id")
      .eq("campaign_id", campaignId)
      .eq("role", "campaign_leader")
      .limit(1)
      .maybeSingle<CampaignLeader>();

    if (leaderError || !leader) {
      return json({ error: "Campaign leader not found" }, 404);
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("id", leader.user_id)
      .single<UserInfo>();

    if (userError || !user) {
      return json({ error: "Campaign leader user not found" }, 404);
    }

    const recipientEmail = user.email ?? campaign.contact_email;

    if (!recipientEmail) {
      return json({ error: "Campaign leader email not found" }, 404);
    }

    const email = buildEmail({
      type,
      campaign,
      user,
      dashboardUrl,
      grantInfoUrl,
    });

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: [{ email: recipientEmail, name: getDisplayName(user) }],
        replyTo:
          type === "campaign_denied" ? { email: denialReplyTo, name: fromName } : undefined,
        subject: email.subject,
        htmlContent: email.htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo email error:", errorText);
      return json({ error: "Failed to send email" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("send-campaign-email error:", error);
    return json({ error: "Unexpected error" }, 500);
  }
});
