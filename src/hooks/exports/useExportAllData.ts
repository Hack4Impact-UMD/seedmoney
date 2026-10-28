import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { strToU8, zipSync } from "fflate";
import {
  readAllApplicationsForExport,
  readAllUsersForExport,
} from "@/src/actions/db/exports";
import { buildCsv, downloadFile } from "@/src/lib/utils/csv";
import { USER_EXPORT_COLUMNS } from "@/src/lib/exports/userExportColumns";
import { APPLICATION_EXPORT_COLUMNS } from "@/src/lib/exports/applicationExportColumns";

type ExportCounts = { users: number; applications: number };

// Reads live data on each call (bypassing the query cache) and downloads one
// zip containing a users CSV and an applications & campaigns CSV.
export default function useExportAllData() {
  return useMutation<ExportCounts, Error, void>({
    mutationFn: async () => {
      const [users, applications] = await Promise.all([
        readAllUsersForExport(),
        readAllApplicationsForExport(),
      ]);

      const date = moment().format("YYYY-MM-DD");
      const zip = zipSync({
        [`seedmoney-users-${date}.csv`]: strToU8(
          buildCsv(USER_EXPORT_COLUMNS, users),
        ),
        [`seedmoney-applications-${date}.csv`]: strToU8(
          buildCsv(APPLICATION_EXPORT_COLUMNS, applications),
        ),
      });

      downloadFile(
        `seedmoney-export-${date}.zip`,
        new Blob([zip], { type: "application/zip" }),
      );

      return { users: users.length, applications: applications.length };
    },
  });
}
