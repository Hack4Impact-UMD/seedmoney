import { NextRequest, NextResponse } from "next/server";
import { campaignHandlers } from "./campaign";
import { transactionHandlers } from "./transactions";
import { WebhookPayload } from "./types";

const eventHandlers = {
  ...campaignHandlers,
  ...transactionHandlers,
} as Record<string, (payload: WebhookPayload) => Promise<void>>;

export async function POST(req: NextRequest) {
  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const handler = eventHandlers[body.event];

  if (!handler) {
    return NextResponse.json({ message: "Ignored" }, { status: 200 });
  }

  try {
    await handler(body);
    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Givebutter webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
