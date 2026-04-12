import { NextRequest, NextResponse } from "next/server";
import { campaignHandlers } from "./campaign";
import { transactionHandlers } from "./transactions";

interface WebhookPayload {
  event: string;
  data?: unknown;
}

const eventHandlers: Record<string, (payload: WebhookPayload) => Promise<void>> = {
  ...campaignHandlers,
  ...transactionHandlers,
};

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

  await handler(body);
  return NextResponse.json({ message: "OK" }, { status: 200 });
}