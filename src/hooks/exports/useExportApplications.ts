import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { readAllApplicationsForExport } from "@/src/actions/db/exports";
import {
  buildCsv,
  downloadCsv,
  formatCsvBoolean,
  formatCsvDate,
  formatCsvList,
  type CsvColumn,
} from "@/src/lib/utils/csv";
import { getStatusLabel } from "@/src/lib/utils/statusConversions";
import type { ApplicationExportRow } from "@/src/types/frontend/exports";

export const APPLICATION_EXPORT_COLUMNS: CsvColumn<ApplicationExportRow>[] = [
  { header: "Campaign ID", value: (c) => c.campaign_id },
  { header: "Campaign Name", value: (c) => c.name },
  { header: "Organization", value: (c) => c.organization_name },
  { header: "Status", value: (c) => getStatusLabel(c.status) },
  { header: "Competition Year", value: (c) => c.competition_year },
  { header: "Date Created", value: (c) => formatCsvDate(c.date_created) },
  {
    header: "Leader Name",
    value: (c) =>
      [c.leader?.first_name, c.leader?.last_name].filter(Boolean).join(" "),
  },
  { header: "Leader Email", value: (c) => c.leader?.email },
  { header: "Contact First Name", value: (c) => c.contact_first_name },
  { header: "Contact Last Name", value: (c) => c.contact_last_name },
  { header: "Contact Email", value: (c) => c.contact_email },
  { header: "Contact Role", value: (c) => c.contact_role },
  { header: "Street", value: (c) => c.street },
  { header: "City", value: (c) => c.city },
  { header: "State", value: (c) => c.state },
  { header: "Zip Code", value: (c) => c.zipcode },
  { header: "Country", value: (c) => c.country },
  { header: "Mailing Street 1", value: (c) => c.mailing_street_1 },
  { header: "Mailing Street 2", value: (c) => c.mailing_street_2 },
  { header: "Mailing City", value: (c) => c.mailing_city },
  { header: "Mailing State", value: (c) => c.mailing_state },
  { header: "Mailing Zip Code", value: (c) => c.mailing_zipcode },
  { header: "Mailing Country", value: (c) => c.mailing_country },
  { header: "Project Category", value: (c) => c.project_category },
  {
    header: "Project Beneficiaries",
    value: (c) => formatCsvList(c.project_beneficiaries ?? []),
  },
  { header: "Existence", value: (c) => c.existence },
  { header: "Size", value: (c) => c.size },
  { header: "Impact", value: (c) => c.impact },
  { header: "Goal", value: (c) => c.goal },
  { header: "Raised", value: (c) => c.raised },
  { header: "Donors", value: (c) => c.donors },
  { header: "EIN", value: (c) => c.ein },
  { header: "Givebutter Link", value: (c) => c.givebutterlink },
  { header: "AI Opt-In", value: (c) => formatCsvBoolean(c.opt_in_ai) },
];

// Reads live data on each call (bypassing the query cache) and downloads it.
// Resolves to the number of exported campaigns.
export default function useExportApplications() {
  return useMutation<number, Error, void>({
    mutationFn: async () => {
      const campaigns = await readAllApplicationsForExport();
      downloadCsv(
        `seedmoney-applications-${moment().format("YYYY-MM-DD")}.csv`,
        buildCsv(APPLICATION_EXPORT_COLUMNS, campaigns),
      );
      return campaigns.length;
    },
  });
}
