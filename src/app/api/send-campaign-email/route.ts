import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase-client";

type SendCampaignEmailType =
  | "campaign_submitted"
  | "campaign_approved"
  | "campaign_denied";

const emailTypes = new Set<SendCampaignEmailType>([
  "campaign_submitted",
  "campaign_approved",
  "campaign_denied",
]);

function isEmailType(value: unknown): value is SendCampaignEmailType {
  return typeof value === "string" && emailTypes.has(value as SendCampaignEmailType);
}

async function readFunctionErrorBody(error: unknown) {
  const context = (error as { context?: unknown } | null)?.context;

  if (!(context instanceof Response)) {
    return null;
  }

  const text = await context.clone().text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getFunctionStatus(error: unknown) {
  const context = (error as { context?: unknown } | null)?.context;
  return context instanceof Response ? context.status : 500;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("[send-campaign-email] invalid API route JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = (body as { type?: unknown }).type;
  const campaignId = Number((body as { campaign_id?: unknown }).campaign_id);

  if (!isEmailType(type)) {
    console.error("[send-campaign-email] invalid email type", {
      received: type,
    });
    return NextResponse.json(
      { error: "Invalid email type", received: type },
      { status: 400 },
    );
  }

  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    console.error("[send-campaign-email] invalid campaign_id", {
      received: (body as { campaign_id?: unknown }).campaign_id,
    });
    return NextResponse.json(
      {
        error: "Invalid campaign_id",
        received: (body as { campaign_id?: unknown }).campaign_id,
      },
      { status: 400 },
    );
  }

  console.info("[send-campaign-email] server invoking remote edge function", {
    type,
    campaignId,
  });

  try {
    const supabase = await createServerClient();
    const result = await supabase.functions.invoke("send-campaign-email", {
      body: {
        type,
        campaign_id: campaignId,
      },
    });

    if (result.error) {
      const responseBody = await readFunctionErrorBody(result.error);
      const status = getFunctionStatus(result.error);

      console.error("[send-campaign-email] remote edge function failed", {
        type,
        campaignId,
        status,
        error: result.error,
        responseBody,
      });

      return NextResponse.json(
        {
          error: "send-campaign-email failed",
          status,
          details: responseBody,
        },
        { status },
      );
    }

    console.info("[send-campaign-email] remote edge function succeeded", {
      type,
      campaignId,
      data: result.data,
    });

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("[send-campaign-email] API route unexpected error", {
      type,
      campaignId,
      error,
    });

    return NextResponse.json(
      {
        error: "Unexpected email send error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
