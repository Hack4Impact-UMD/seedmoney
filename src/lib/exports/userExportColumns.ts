import {
  formatCsvBoolean,
  formatCsvDate,
  formatCsvList,
  type CsvColumn,
} from "@/src/lib/utils/csv";
import type { UserExportRow } from "@/src/types/frontend/exports";

export const USER_EXPORT_COLUMNS: CsvColumn<UserExportRow>[] = [
  { header: "user_id", value: (user) => user.id },
  { header: "first_name", value: (user) => user.first_name },
  { header: "middle_name", value: (user) => user.middle_name },
  { header: "last_name", value: (user) => user.last_name },
  { header: "email", value: (user) => user.email },
  {
    header: "phone_number",
    value: (user) => user.phone_number,
    asText: true,
  },
  { header: "is_admin", value: (user) => formatCsvBoolean(user.is_admin) },
  { header: "created_at", value: (user) => formatCsvDate(user.created_at) },
  {
    header: "has_application",
    value: (user) => formatCsvBoolean(user.led_campaigns.length > 0),
  },
  { header: "campaigns_led", value: (user) => user.led_campaigns.length },
  {
    header: "campaign_ids",
    value: (user) =>
      formatCsvList(user.led_campaigns.map((campaign) => campaign.campaign_id)),
  },
  {
    header: "campaign_names",
    value: (user) =>
      formatCsvList(user.led_campaigns.map((campaign) => campaign.name)),
  },
  {
    header: "campaign_statuses",
    value: (user) =>
      formatCsvList(
        user.led_campaigns.map((campaign) => campaign.status),
      ),
  },
];
