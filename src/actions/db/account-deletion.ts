"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/src/lib/supabase-client";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { unpublishCampaignAsLeader } from "@/src/actions/givebutter/campaignsGivebutter";
import type { Status } from "@/src/types/db/enums";
import type {
  AccountDeletionOverview,
  CampaignTransfer,
  DeleteOwnAccountResult,
  OwnedCampaign,
  TransferStatus,
} from "@/src/types/accountDeletion";

// Shared contract with the campaign-transfer workstream.
// Keep these in sync with the transfer migration.
const TRANSFER_TABLE = "campaign_transfers";
const TRANSFER_OWNER_COLUMN = "from_user_id";

type OwnedCampaignRow = {
  campaign_id: number;
  name: string | null;
  status: string;
  raised: number | null;
  givebutter_id: string | null;
};

type TransferRow = {
  id: string;
  campaign_id: number;
  recipient_email: string;
  status: string;
  created_at: string;
  expires_at: string;
};

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return { supabase, user };
}

async function readOwnedCampaigns(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      campaign_id,
      name,
      status,
      raised,
      givebutter_id,
      campaign_members!inner(user_id, role)
    `)
    .eq("campaign_members.user_id", userId)
    .eq("campaign_members.role", "campaign_leader")
    .order("campaign_id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load owned campaigns: ${error.message}`);
  }

  return (data ?? []) as OwnedCampaignRow[];
}

async function readTransfers(
  supabase: SupabaseClient,
  userId: string,
): Promise<CampaignTransfer[]> {
  const { data, error } = await supabase
    .from(TRANSFER_TABLE)
    .select("id, campaign_id, recipient_email, status, created_at, expires_at")
    .eq(TRANSFER_OWNER_COLUMN, userId)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load campaign transfers: ${error.message}`);
  }

  const rows = (data ?? []) as TransferRow[];
  const campaignIds = [...new Set(rows.map((row) => row.campaign_id))];

  if (campaignIds.length === 0) {
    return [];
  }

  const { data: campaignRows, error: campaignError } = await supabase
    .from("campaigns")
    .select("campaign_id, name")
    .in("campaign_id", campaignIds);

  if (campaignError) {
    throw new Error(
      `Failed to load transfer campaigns: ${campaignError.message}`,
    );
  }

  const nameByCampaignId = new Map<number, string>();

  for (const campaign of campaignRows ?? []) {
    nameByCampaignId.set(campaign.campaign_id, campaign.name || "Campaign");
  }

  return rows.map<CampaignTransfer>((row) => {
    const isExpired =
      row.status === "pending" &&
      new Date(row.expires_at).getTime() <= Date.now();

    return {
      id: row.id,
      campaignId: row.campaign_id,
      campaignName: nameByCampaignId.get(row.campaign_id) ?? "Campaign",
      recipientEmail: row.recipient_email,
      status: isExpired ? "expired" : (row.status as TransferStatus),
      sentAt: row.created_at,
      expiresAt: row.expires_at,
    };
  });
}

export async function getAccountDeletionOverview(): Promise<AccountDeletionOverview> {
  const { supabase, user } = await requireUser();
  const serviceSupabase = createServiceRoleClient();

  const [ownedRows, allTransfers] = await Promise.all([
    readOwnedCampaigns(supabase, user.id),
    readTransfers(serviceSupabase, user.id),
  ]);

  const ownedCampaigns: OwnedCampaign[] = ownedRows.map((campaign) => ({
    campaign_id: campaign.campaign_id,
    name: campaign.name ?? "",
    status: campaign.status as Status,
    raised: campaign.raised ?? 0,
  }));

  const ownedCampaignIds = new Set(
    ownedCampaigns.map((campaign) => campaign.campaign_id),
  );

  // Keep pending invitations and transferred-away campaigns. Drop accepted
  // transfers for campaigns the user owns again (a transfer-back), and drop
  // expired invitations because they no longer block deletion.
  const transfers = allTransfers.filter(
    (transfer) =>
      transfer.status === "pending" ||
      !ownedCampaignIds.has(transfer.campaignId),
  );

  return {
    ownedCampaigns,
    transfers,
    canDelete: !transfers.some(
      (transfer) => transfer.status === "pending",
    ),
  };
}

async function campaignIsLedBy(
  supabase: SupabaseClient,
  campaignId: number,
  userId: string,
) {
  const { data, error } = await supabase
    .from("campaign_members")
    .select("campaign_id")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .eq("role", "campaign_leader")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to verify campaign ownership: ${error.message}`,
    );
  }

  return data !== null;
}

/**
 * Move an already-unpublished campaign into a state the cron cannot publish.
 * `suspended` is the existing "not live" status, and the admin Approved
 * Campaigns page already includes it.
 */
async function markCampaignUnpublishable(
  supabase: SupabaseClient,
  campaignId: number,
  status: "in_progress" | "approved",
) {
  const { data, error } = await supabase
    .from("campaigns")
    .update({ status: "suspended" })
    .eq("campaign_id", campaignId)
    .eq("status", status)
    .select("campaign_id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to unpublish campaign ${campaignId}: ${error.message}`,
    );
  }

  if (data) {
    return;
  }

  // A concurrent change moved it. It is only safe if it is no longer
  // publishable.
  const { data: current, error: readError } = await supabase
    .from("campaigns")
    .select("status")
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (readError) {
    throw new Error(
      `Failed to read campaign ${campaignId}: ${readError.message}`,
    );
  }

  if (
    !current ||
    current.status === "published" ||
    current.status === "approved" ||
    current.status === "in_progress"
  ) {
    throw new Error(`Campaign ${campaignId} could not be made unpublishable`);
  }
}

export async function deleteOwnAccount(): Promise<DeleteOwnAccountResult> {
  const auth = await requireUser().catch(() => null);

  if (!auth) {
    return {
      success: false,
      error: "You must be signed in to delete your account.",
    };
  }

  const { supabase, user } = auth;

  try {
    const serviceSupabase = createServiceRoleClient();
    const ownedCampaigns = await readOwnedCampaigns(supabase, user.id);
    const transfersBeforeCleanup = await readTransfers(
      serviceSupabase,
      user.id,
    );

    if (
      transfersBeforeCleanup.some(
        (transfer) => transfer.status === "pending",
      )
    ) {
      return {
        success: false,
        error:
          "Accept or cancel your pending campaign transfers before deleting your account.",
      };
    }

    for (const campaign of ownedCampaigns) {
      // Re-check immediately before mutating. A transfer accepted during the
      // flow must not cause us to unpublish the new owner's campaign.
      const stillLeader = await campaignIsLedBy(
        serviceSupabase,
        campaign.campaign_id,
        user.id,
      );

      if (!stillLeader) {
        continue;
      }

      if (
        campaign.status === "published" ||
        campaign.status === "suspended"
      ) {
        if (!campaign.givebutter_id) {
          if (campaign.status === "published") {
            return {
              success: false,
              error: `"${campaign.name || "One of your campaigns"}" is marked as published but has no Givebutter campaign. Ask an admin to review it before deleting your account.`,
            };
          }

          // Suspended without a Givebutter id was never live; it is already
          // safe to retain.
          continue;
        }

        await unpublishCampaignAsLeader(campaign.campaign_id);
        continue;
      }

      if (
        campaign.status === "in_progress" ||
        campaign.status === "approved"
      ) {
        await markCampaignUnpublishable(
          serviceSupabase,
          campaign.campaign_id,
          campaign.status,
        );
      }
    }

    // Ownership may have changed while we worked. Only proceed if every
    // campaign we still own is nonpublishable.
    const remainingCampaigns = await readOwnedCampaigns(
      supabase,
      user.id,
    );
    const stillPublishable = remainingCampaigns.filter(
      (campaign) =>
        campaign.status === "published" ||
        campaign.status === "approved" ||
        campaign.status === "in_progress",
    );

    if (stillPublishable.length > 0) {
      return {
        success: false,
        error:
          "Some of your campaigns changed while your account was being deleted. Review them and try again.",
      };
    }

    const transfersAfterCleanup = await readTransfers(
      serviceSupabase,
      user.id,
    );

    if (
      transfersAfterCleanup.some(
        (transfer) => transfer.status === "pending",
      )
    ) {
      return {
        success: false,
        error:
          "A campaign transfer is still pending. Accept or cancel it, then try again.",
      };
    }

    // Supabase refuses to delete an Auth user who owns Storage objects.
    // Clear ownership instead of deleting the photos, so campaign content and
    // image URLs are preserved for the retained campaigns.
    const { error: storageError } = await serviceSupabase.rpc(
      "clear_campaign_image_ownership",
      { p_user_id: user.id },
    );

    if (storageError) {
      console.error(
        "Failed to clear campaign image ownership:",
        storageError,
      );
      return {
        success: false,
        error:
          "We couldn't preserve your campaign photos, so your account was not deleted. Please try again.",
      };
    }

    // Hard-delete the Auth user. public.users and campaign_members cascade
    // from auth.users, so the profile does not need a separate delete.
    const { error: deleteError } =
      await serviceSupabase.auth.admin.deleteUser(user.id, false);

    if (deleteError) {
      console.error("Failed to delete Supabase Auth user:", deleteError);
      return {
        success: false,
        error:
          "Your campaigns are unpublished, but your account could not be deleted. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Account deletion failed:", error);
    return {
      success: false,
      error:
        "We couldn't finish deleting your account, so it is still active. Please try again.",
    };
  }
}