import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { readAllUsersForExport } from "@/src/actions/db/exports";
import {
  buildCsv,
  downloadCsv,
  formatCsvBoolean,
  formatCsvDate,
  formatCsvList,
  type CsvColumn,
} from "@/src/lib/utils/csv";
import { getStatusLabel } from "@/src/lib/utils/statusConversions";
import type { UserExportRow } from "@/src/types/frontend/exports";

export const USER_EXPORT_COLUMNS: CsvColumn<UserExportRow>[] = [
  { header: "User ID", value: (user) => user.id },
  { header: "First Name", value: (user) => user.first_name },
  { header: "Middle Name", value: (user) => user.middle_name },
  { header: "Last Name", value: (user) => user.last_name },
  { header: "Email", value: (user) => user.email },
  { header: "Phone", value: (user) => user.phone_number },
  { header: "Is Admin", value: (user) => formatCsvBoolean(user.is_admin) },
  { header: "Created At", value: (user) => formatCsvDate(user.created_at) },
  {
    header: "Has Application",
    value: (user) => formatCsvBoolean(user.led_campaigns.length > 0),
  },
  { header: "Campaigns Led", value: (user) => user.led_campaigns.length },
  {
    header: "Campaign IDs",
    value: (user) =>
      formatCsvList(user.led_campaigns.map((campaign) => campaign.campaign_id)),
  },
  {
    header: "Campaign Names",
    value: (user) =>
      formatCsvList(user.led_campaigns.map((campaign) => campaign.name)),
  },
  {
    header: "Campaign Statuses",
    value: (user) =>
      formatCsvList(
        user.led_campaigns.map((campaign) => getStatusLabel(campaign.status)),
      ),
  },
];

// Reads live data on each call (bypassing the query cache) and downloads it.
// Resolves to the number of exported users.
export default function useExportUsers() {
  return useMutation<number, Error, void>({
    mutationFn: async () => {
      const users = await readAllUsersForExport();
      downloadCsv(
        `seedmoney-users-${moment().format("YYYY-MM-DD")}.csv`,
        buildCsv(USER_EXPORT_COLUMNS, users),
      );
      return users.length;
    },
  });
}
