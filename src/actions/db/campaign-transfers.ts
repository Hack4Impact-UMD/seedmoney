"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { createServerClient } from "@/src/lib/supabase-client";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { requireCampaignLeader } from "@/src/lib/requireCampaignLeader";
import type { ActionResult } from "@/src/lib/utils/actionResult";
import type {
  CampaignTransfer,
  TransferStatus,
} from "@/src/types/accountDeletion";

export type AcceptTransferResult =
  | "accepted"
  | "not_found"
  | "expired"
  | "cancelled"
  | "already_accepted"
  | "email_mismatch"
  | "invalid"
  | "profile_missing";

export type TransferInvitation = {
  status: TransferStatus;
  campaignName: string;
  inviterName: string;
  maskedRecipientEmail: string;
  isSignedIn: boolean;
  isRecipient: boolean;
};

type TransferRow = {
  transfer_id: string;
  campaign_id: number;
  recipient_email: string;
  status: TransferStatus;
  sent_at: string;
  expires_at: string;
};

const TRANSFER_COLUMNS =
  "transfer_id, campaign_id, recipient_email, status, sent_at, expires_at";
const TRANSFER_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Wrapper to minimize repeated error handling
async function runAction<T>(
  label: string,
  action: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await action();
  } catch (error) {
    console.error(`Error ${label}:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Must match encode(sha256(convert_to(token, 'UTF8')), 'hex') in accept_campaign_transfer.
function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

// Returns the fields shared by a new or resent invitation.
function newInvitationFields() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    fields: {
      token_hash: hashToken(token),
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + TRANSFER_EXPIRY_MS).toISOString(),
    },
  };
}

// Pending rows past expires_at count as expired before their status is updated.
function getEffectiveStatus(row: Pick<TransferRow, "status" | "expires_at">) {
  return row.status === "pending" && new Date(row.expires_at) <= new Date()
    ? "expired"
    : row.status;
}

function toCampaignTransfer(row: TransferRow): CampaignTransfer {
  return {
    id: row.transfer_id,
    campaignId: row.campaign_id,
    recipientEmail: row.recipient_email,
    status: getEffectiveStatus(row),
    sentAt: row.sent_at,
    expiresAt: row.expires_at,
  };
}

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return user;
}

async function sendTransferEmail(
  type: "transfer_invitation" | "transfer_completed",
  campaignId: number,
  transferId: string,
  token?: string,
) {
  try {
    let acceptUrl: string | undefined;
    if (token) {
      const origin = (await headers()).get("origin");
      acceptUrl = `${origin}/transfer/accept?token=${encodeURIComponent(token)}`;
    }

    const { error } = await createServiceRoleClient().functions.invoke(
      "send-campaign-email",
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

export async function readActiveCampaignTransfer(campaignId: number) {
  return runAction<{ transfer: CampaignTransfer | null }>(
    "reading campaign transfer",
    async () => {
      const { supabase } = await requireCampaignLeader(campaignId);

      const { data, error } = await supabase
        .from("campaign_transfers")
        .select(TRANSFER_COLUMNS)
        .eq("campaign_id", campaignId)
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw new Error(`Failed to load transfer: ${error.message}`);

      return {
        ok: true,
        transfer: data ? toCampaignTransfer(data as TransferRow) : null,
      };
    },
  );
}

export async function sendTransferInvitation(
  campaignId: number,
  recipientEmail: string,
) {
  return runAction<{ transfer: CampaignTransfer; emailSent: boolean }>(
    "sending transfer invitation",
    async () => {
      const email = normalizeEmail(recipientEmail);

      if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, error: "Enter a valid email address." };
      }

      const { user } = await requireCampaignLeader(campaignId);

      if (email === normalizeEmail(user.email ?? "")) {
        return {
          ok: false,
          error: "You can't transfer a campaign to yourself.",
        };
      }

      const supabase = createServiceRoleClient();

      // Free up the one-pending-per-campaign index from invitations that lapsed.
      const { error: expireError } = await supabase
        .from("campaign_transfers")
        .update({ status: "expired" })
        .eq("campaign_id", campaignId)
        .eq("status", "pending")
        .lte("expires_at", new Date().toISOString());

      if (expireError) {
        throw new Error(`Failed to expire transfers: ${expireError.message}`);
      }

      const { token, fields } = newInvitationFields();
      const { data, error } = await supabase
        .from("campaign_transfers")
        .insert({
          campaign_id: campaignId,
          inviter_id: user.id,
          recipient_email: email,
          ...fields,
        })
        .select(TRANSFER_COLUMNS)
        .single();

      if (error?.code === "23505") {
        return {
          ok: false,
          error: "This campaign already has a pending transfer.",
        };
      }

      if (error) throw new Error(`Failed to create transfer: ${error.message}`);

      const row = data as TransferRow;
      const emailSent = await sendTransferEmail(
        "transfer_invitation",
        campaignId,
        row.transfer_id,
        token,
      );

      return { ok: true, transfer: toCampaignTransfer(row), emailSent };
    },
  );
}

// Issues a new link (invalidating the old one) and restarts the expiry window.
export async function resendTransferInvitation(transferId: string) {
  return runAction<{ transfer: CampaignTransfer; emailSent: boolean }>(
    "resending transfer invitation",
    async () => {
      const user = await requireUser();
      const { token, fields } = newInvitationFields();

      const { data, error } = await createServiceRoleClient()
        .from("campaign_transfers")
        .update(fields)
        .eq("transfer_id", transferId)
        .eq("inviter_id", user.id)
        .eq("status", "pending")
        .select(TRANSFER_COLUMNS)
        .maybeSingle();

      if (error) throw new Error(`Failed to resend transfer: ${error.message}`);

      if (!data) {
        return { ok: false, error: "This transfer is no longer pending." };
      }

      const row = data as TransferRow;
      const emailSent = await sendTransferEmail(
        "transfer_invitation",
        row.campaign_id,
        row.transfer_id,
        token,
      );

      return { ok: true, transfer: toCampaignTransfer(row), emailSent };
    },
  );
}

export async function cancelTransfer(transferId: string) {
  return runAction<object>("cancelling transfer", async () => {
    const user = await requireUser();

    const { data, error } = await createServiceRoleClient()
      .from("campaign_transfers")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("transfer_id", transferId)
      .eq("inviter_id", user.id)
      .eq("status", "pending")
      .select("transfer_id")
      .maybeSingle();

    if (error) throw new Error(`Failed to cancel transfer: ${error.message}`);

    if (!data) {
      return { ok: false, error: "This transfer is no longer pending." };
    }

    return { ok: true };
  });
}

export async function getTransferInvitation(token: string) {
  return runAction<{ invitation: TransferInvitation }>(
    "reading transfer invitation",
    async () => {
      // Recipients can't read transfers through RLS, so look the token up with
      // the service role and return only what the accept page displays.
      const { data, error } = await createServiceRoleClient()
        .from("campaign_transfers")
        .select(
          `${TRANSFER_COLUMNS},
          campaigns(name),
          users!campaign_transfers_inviter_id_fkey(first_name, last_name)`,
        )
        .eq("token_hash", hashToken(token))
        .maybeSingle();

      if (error) throw new Error(`Failed to load invitation: ${error.message}`);

      if (!data) {
        return { ok: false, error: "This invitation link is invalid." };
      }

      const row = data as unknown as TransferRow & {
        campaigns: { name: string } | null;
        users: { first_name: string; last_name: string } | null;
      };

      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [name, domain] = row.recipient_email.split("@");

      return {
        ok: true,
        invitation: {
          status: getEffectiveStatus(row),
          campaignName: row.campaigns?.name ?? "",
          inviterName: [row.users?.first_name, row.users?.last_name]
            .filter(Boolean)
            .join(" "),
          maskedRecipientEmail: `${name.slice(0, 1)}•••@${domain}`,
          isSignedIn: !!user,
          isRecipient:
            !!user?.email_confirmed_at &&
            normalizeEmail(user.email ?? "") === row.recipient_email,
        },
      };
    },
  );
}

export async function acceptTransfer(token: string) {
  return runAction<{ result: AcceptTransferResult; campaignId: number | null }>(
    "accepting transfer",
    async () => {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .rpc("accept_campaign_transfer", { p_token: token })
        .single();

      if (error) throw new Error(`Failed to accept transfer: ${error.message}`);

      const { result, campaign_id: campaignId } = data as {
        result: AcceptTransferResult;
        campaign_id: number | null;
      };

      if (result === "accepted" && campaignId !== null) {
        const { data: transfer } = await createServiceRoleClient()
          .from("campaign_transfers")
          .select("transfer_id")
          .eq("token_hash", hashToken(token))
          .maybeSingle();

        if (transfer) {
          await sendTransferEmail(
            "transfer_completed",
            campaignId,
            transfer.transfer_id,
          );
        }
      }

      return { ok: true, result, campaignId };
    },
  );
}
