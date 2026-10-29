
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
  recipientEmail: string;
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

// Props used to connect the transfer component to the account deletion component
export type CampaignTransferFlowProps = {
  campaignId: number;
  onInvitationSent: () => void | Promise<void>;
  onCancel: () => void;
};
