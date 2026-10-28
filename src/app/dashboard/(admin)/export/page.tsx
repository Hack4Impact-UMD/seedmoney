"use client";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import Navbar from "@/src/components/Navbar";
import ExportCard from "@/src/components/export/ExportCard";
import useExportAllData from "@/src/hooks/exports/useExportAllData";

export default function ExportData() {
  const exportAllData = useExportAllData();

  return (
    <div className="flex min-h-screen bg-[#fbfcfb]">
      <Navbar />
      <div className="flex-1 bg-gray-50 px-4 py-6 md:p-10">
        <h3 className="text-4xl font-bold text-[#054A1F]">Export Data</h3>
        <p className="mt-6 text-lg text-[#123A1E]">
          Download user, application, and campaign information
        </p>

        <div className="mt-10 max-w-5xl">
          <ExportCard
            icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 64 }} />}
            title="Users, Applications & Campaigns"
            description="Download a .zip with two CSV files: all registered users, and all application and campaign records, including unpublished and suspended campaigns."
            includes={[
              "All registered users, including those without applications",
              "All applications and campaigns, regardless of status",
              "All applicant-entered information",
              "Campaign leader name and email",
              "Campaign IDs and fundraising details",
            ]}
            buttonLabel="Export All Data"
            confirmTitle="Export Data"
            confirmMessage="Are you sure you want to download all user, application, and campaign information?"
            successMessage="Your data has been downloaded successfully."
            exportMutation={exportAllData}
          />
        </div>
      </div>
    </div>
  );
}
