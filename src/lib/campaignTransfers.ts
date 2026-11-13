import "server-only";

import { createHash } from "node:crypto";
import { createServiceRoleClient } from "@/src/lib/supabase-service";

// Result codes returned by the accept_campaign_transfer database function.
export type AcceptTransferResult =
  | "accepted"
  | "not_found"
  | "expired"
  | "cancelled"
  | "already_accepted"
  | "email_mismatch"
  | "invalid"
  | "profile_missing";

// Must match encode(sha256(convert_to(token, 'UTF8')), 'hex') in accept_campaign_transfer.
export function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function getAcceptUrl(origin: string, token: string) {
  return `${origin}/transfer/accept?token=${encodeURIComponent(token)}`;
}

// Email failures are logged, not thrown, so the transfer itself still succeeds.
export async function sendTransferEmail(
  type: "transfer_invitation" | "transfer_completed",
  campaignId: number,
  transferId: string,
  acceptUrl?: string,
) {
  try {
    const { error } = await createServiceRoleClient().functions.invoke(
      "send-transfer-email",
      {
        body: {
          type,
          campaign_id: campaignId,
          transfer: { transfer_id: transferId, accept_url: acceptUrl },
        },
      },
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error sending ${type} email:`, error);
    return false;
  }
}
