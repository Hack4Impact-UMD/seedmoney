export type CampaignImageRecord = {
  id: number;
  campaign_id: number;
  storage_path: string;
  display_order: number;
  is_main: boolean;
};

export type CampaignFile = {
  file: File;
  campaignId: number;
  displayOrder: number;
  isMain?: boolean;
};

export type DeleteCampaignFile = {
  campaignId: number;
  storagePath: string;
};
