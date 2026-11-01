"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { createServerClient } from "@/src/lib/supabase-client";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { requireCampaignLeader } from "@/src/lib/requireCampaignLeader";
import {
  getAcceptUrl,
  hashToken,
  sendTransferEmail,
} from "@/src/lib/campaignTransfers";
import type { ActionResult } from "@/src/lib/utils/actionResult";
import type {
  CampaignTransfer,
  TransferStatus,
} from "@/src/types/accountDeletion";

export type CampaignTransferSummary = CampaignTransfer & {
  campaignName: string;
  recipientName: string | null;
};

export type AcceptedTransfer = {
  campaignName: string;
  inviterName: string;
  acceptedAt: string;
};

type TransferRow = {
  transfer_id: string;
  campaign_id: number;
  recipient_email: string;
  status: TransferStatus;
  sent_at: string;
  expires_at: string;
};

type UserName = { first_name: string | null; last_name: string | null };

const TRANSFER_COLUMNS =
  "transfer_id, campaign_id, recipient_email, status, sent_at, expires_at";
const TRANSFER_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Statuses the inviter can still resend or cancel.
const OPEN_STATUSES: TransferStatus[] = ["pending", "expired"];

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

function formatName(user: UserName | null | undefined) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ");
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

async function getRequestAcceptUrl(token: string) {
  const origin = (await headers()).get("origin");

  if (!origin) {
    throw new Error("Unable to determine site origin");
  }

  return getAcceptUrl(origin, token);
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

// Returns the campaign's latest transfer if it is still pending or expired.
export async function readActiveCampaignTransfer(campaignId: number) {
  return runAction<{ transfer: CampaignTransfer | null }>(
    "reading campaign transfer",
    async () => {
      const { supabase } = await requireCampaignLeader(campaignId);

      const { data, error } = await supabase
        .from("campaign_transfers")
        .select(TRANSFER_COLUMNS)
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(`Failed to load transfer: ${error.message}`);

      const transfer = data ? toCampaignTransfer(data as TransferRow) : null;

      return {
        ok: true,
        transfer:
          transfer && OPEN_STATUSES.includes(transfer.status) ? transfer : null,
      };
    },
  );
}

// The signed-in user's latest transfer per campaign they invited for, with
// names they can't read through RLS (they may no longer be a member).
export async function readMyCampaignTransfers() {
  return runAction<{ transfers: CampaignTransferSummary[] }>(
    "reading campaign transfers",
    async () => {
      const user = await requireUser();
      const supabase = createServiceRoleClient();

      const { data, error } = await supabase
        .from("campaign_transfers")
        .select(
          `${TRANSFER_COLUMNS},
          campaigns(name),
          users!campaign_transfers_accepted_by_fkey(first_name, last_name)`,
        )
        .eq("inviter_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`Failed to load transfers: ${error.message}`);

      const rows = data as unknown as (TransferRow & {
        campaigns: { name: string } | null;
        users: UserName | null;
      })[];

      const latestPerCampaign = new Map<number, (typeof rows)[number]>();
      for (const row of rows) {
        if (!latestPerCampaign.has(row.campaign_id)) {
          latestPerCampaign.set(row.campaign_id, row);
        }
      }
      const latest = [...latestPerCampaign.values()].filter(
        (row) => row.status !== "cancelled",
      );

      // Recipients who haven't accepted yet may already have an account.
      const { data: recipients, error: recipientsError } = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .in(
          "email",
          latest.map((row) => row.recipient_email),
        );

      if (recipientsError) {
        throw new Error(
          `Failed to load recipients: ${recipientsError.message}`,
        );
      }

      const namesByEmail = new Map(
        (recipients ?? []).map((recipient) => [
          normalizeEmail(recipient.email ?? ""),
          formatName(recipient),
        ]),
      );

      return {
        ok: true,
        transfers: latest.map((row) => ({
          ...toCampaignTransfer(row),
          campaignName: row.campaigns?.name ?? "",
          recipientName:
            formatName(row.users) ||
            namesByEmail.get(row.recipient_email) ||
            null,
        })),
      };
    },
  );
}

// For the new owner's welcome modal after accepting a transfer.
export async function readAcceptedTransfer(campaignId: number) {
  return runAction<{ transfer: AcceptedTransfer | null }>(
    "reading accepted transfer",
    async () => {
      const user = await requireUser();

      const { data, error } = await createServiceRoleClient()
        .from("campaign_transfers")
        .select(
          `accepted_at,
          campaigns(name),
          users!campaign_transfers_inviter_id_fkey(first_name, last_name)`,
        )
        .eq("campaign_id", campaignId)
        .eq("accepted_by", user.id)
        .eq("status", "accepted")
        .order("accepted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(`Failed to load transfer: ${error.message}`);

      if (!data) return { ok: true, transfer: null };

      const row = data as unknown as {
        accepted_at: string;
        campaigns: { name: string } | null;
        users: UserName | null;
      };

      return {
        ok: true,
        transfer: {
          campaignName: row.campaigns?.name ?? "",
          inviterName: formatName(row.users),
          acceptedAt: row.accepted_at,
        },
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
        await getRequestAcceptUrl(token),
      );

      return { ok: true, transfer: toCampaignTransfer(row), emailSent };
    },
  );
}

// Issues a new link (invalidating the old one) and restarts the expiry window.
// Works on pending and expired invitations.
export async function resendTransferInvitation(transferId: string) {
  return runAction<{ transfer: CampaignTransfer; emailSent: boolean }>(
    "resending transfer invitation",
    async () => {
      const user = await requireUser();
      const { token, fields } = newInvitationFields();

      const { data, error } = await createServiceRoleClient()
        .from("campaign_transfers")
        .update({ ...fields, status: "pending" })
        .eq("transfer_id", transferId)
        .eq("inviter_id", user.id)
        .in("status", OPEN_STATUSES)
        .select(TRANSFER_COLUMNS)
        .maybeSingle();

      if (error?.code === "23505") {
        return {
          ok: false,
          error: "This campaign already has a pending transfer.",
        };
      }

      if (error) throw new Error(`Failed to resend transfer: ${error.message}`);

      if (!data) {
        return { ok: false, error: "This transfer can no longer be resent." };
      }

      const row = data as TransferRow;
      const emailSent = await sendTransferEmail(
        "transfer_invitation",
        row.campaign_id,
        row.transfer_id,
        await getRequestAcceptUrl(token),
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
      .in("status", OPEN_STATUSES)
      .select("transfer_id")
      .maybeSingle();

    if (error) throw new Error(`Failed to cancel transfer: ${error.message}`);

    if (!data) {
      return { ok: false, error: "This transfer can no longer be cancelled." };
    }

    return { ok: true };
  });
}
