import type { Campaign } from "./db/campaigns";

// Status of a campaign ownership transfer
export type TransferStatus =
  | "pending"
  | "accepted"
  | "cancelled"
  | "expired";

// Campaign information needed for account deletion
export type OwnedCampaign = Pick<
  Campaign,
  "campaign_id" | "name" | "status" | "raised"
>;

// Information about a campaign transfer invitation
export type CampaignTransfer = {
  id: string;
  campaignId: number;
  campaignName: string;
  recipientEmail: string;
  // Set once the recipient has an account (always after acceptance).
  recipientName?: string | null;
  status: TransferStatus;
  sentAt: string;
  expiresAt: string;
};

// Information needed to display the deletion flow
export type AccountDeletionOverview = {
  ownedCampaigns: OwnedCampaign[];
  transfers: CampaignTransfer[];
  canDelete: boolean;
};

export type DeleteOwnAccountResult =
  | { success: true }
  | { success: false; error: string };

// Props used to connect the transfer component to the account deletion component
export type CampaignTransferFlowProps = {
  campaignId: number;
  campaignName: string;
  // emailSent is false if the invitation was saved but its email failed.
  onInvitationSent: (emailSent: boolean) => void | Promise<void>;
  onCancel: () => void;
};