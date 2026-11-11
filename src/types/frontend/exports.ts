import type { Campaign } from "../db/campaigns";
import type { Users } from "../db/users";

export type ExportCampaign = Pick<Campaign, "campaign_id" | "name" | "status">;

export type UserExportRow = Users & {
  led_campaigns: ExportCampaign[];
};

export type ExportLeader = Pick<Users, "first_name" | "last_name" | "email">;

// A campaign photo: its campaign_image_records id and a link to the file
export type ExportPhoto = {
  id: number;
  url: string;
  is_main: boolean;
};

export type ApplicationExportRow = Campaign & {
  leader: ExportLeader | null;
  competition_year: number | null;
  story_answers: [string, string, string, string];
  // Main photo first, then in display order
  photos: ExportPhoto[];
};
