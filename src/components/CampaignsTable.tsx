"use client";

import { useMemo, useState } from "react";
import { IconButton, MenuItem, TextField } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useRouter } from "next/navigation";
import type { Status } from "@/src/types/db/enums";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "../hooks/users/useUserByAuthId";

interface Props {
  initialData: CampaignWithLeader[];
  isAdmin: boolean
}

const pageSizeOptions = [5, 10, 20];

const statusConfig: Record<
  Status,
  { label: string; borderClass: string; textClass: string }
> = {
  approved: {
    label: "Approved",
    borderClass: "border-[#1976D2]",
    textClass: "text-[#1976D2]",
  },
  archived: {
    label: "Archived",
    borderClass: "border-[#A6A6A6]",
    textClass: "text-[#A6A6A6]",
  },
  denied: {
    label: "Denied",
    borderClass: "border-[#ED6C02]",
    textClass: "text-[#ED6C02]",
  },
  in_progress: {
    label: "Draft",
    borderClass: "border-[#6A7282]",
    textClass: "text-[#6A7282]",
  },
  pending: {
    label: "Pending",
    borderClass: "border-[#883280]",
    textClass: "text-[#883280]",
  },
  publish_failed: {
    label: "Publish Failed",
    borderClass: "border-[#D32F2F]",
    textClass: "text-[#D32F2F]",
  },
  published: {
    label: "Published",
    borderClass: "border-[#2E7D32]",
    textClass: "text-[#2E7D32]",
  },
};

const unknownStatusConfig = {
  label: "N/A",
  borderClass: "border-[#D32F2F]",
  textClass: "text-[#D32F2F]",
};

function getStatusConfig(status: string) {
  return statusConfig[status as Status] ?? unknownStatusConfig;
}

function getCampaignYear(dateCreated: string) {
  const year = new Date(dateCreated).getFullYear();
  return Number.isNaN(year) ? "N/A" : String(year);
}

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString()}`;
}

function getGoalProgress(
  raised: number | null | undefined,
  goal: number | null | undefined,
) {
  if (!goal || goal <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((raised ?? 0) / goal) * 100));
}

function StatusChip({ status }: { status: string }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-[10px] py-1 text-[13px] leading-[1.1] ${config.borderClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  );
}

export default function CampaignsTable({ initialData }: Props) {
  const router = useRouter();
  const [campaignSearch, setCampaignSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { user } = useAuth();
  
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserByAuthId(user?.id || "");

  if (isLoadingUser) return null;

  if (userError || !userData) throw new Error("Unauthorized");

  const years = useMemo(
    () =>
      [
        ...new Set(
          (initialData ?? []).map((campaign) =>
            getCampaignYear(campaign.date_created),
          ),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [initialData],
  );

  const filteredData = useMemo(() => {
    const normalizedSearch = campaignSearch.trim().toLowerCase();

    return (initialData ?? []).filter((campaign) => {
      const campaignYear = getCampaignYear(campaign.date_created);
      const matchesYear = yearFilter === "all" || campaignYear === yearFilter;

      if (!matchesYear) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const statusLabel = getStatusConfig(campaign.status).label.toLowerCase();

      return (
        campaign.name.toLowerCase().includes(normalizedSearch) ||
        campaign.campaign_leader.toLowerCase().includes(normalizedSearch) ||
        statusLabel.includes(normalizedSearch)
      );
    });
  }, [campaignSearch, initialData, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);

  const paginatedData = useMemo(() => {
    const start = currentPageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [currentPageIndex, filteredData, pageSize]);

  const firstRow =
    filteredData.length === 0 ? 0 : currentPageIndex * pageSize + 1;
  const lastRow = Math.min(
    (currentPageIndex + 1) * pageSize,
    filteredData.length,
  );

  const handleCampaignClick = (campaignId: number) => {

    if (userData.is_admin == true) {
      router.push(`/dashboard/ongoing-campaigns/${campaignId}`);
    }
    else {
      router.push(`/dashboard/${campaignId}`);
    }

  };

  const handleResetFilters = () => {
    setCampaignSearch("");
    setYearFilter("all");
    setPageIndex(0);
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
        <div className="px-4 pt-6">
          <h2 className="text-[16px] font-bold leading-6 text-[rgba(0,0,0,0.87)]">
            Campaign List
          </h2>
          <p className="mt-1 text-sm text-[#6A7282]">
            {initialData.length} Campaign{initialData.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-4 pb-4 pt-6">
          <TextField
            label="Search"
            placeholder="Search by title or name"
            variant="outlined"
            fullWidth
            value={campaignSearch}
            onChange={(event) => {
              setCampaignSearch(event.target.value);
              setPageIndex(0);
            }}
            sx={{ flex: "1 1 320px", minWidth: 220 }}
          />

          <TextField
            select
            label="Filter By Year"
            variant="outlined"
            fullWidth
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value);
              setPageIndex(0);
            }}
            sx={{ flex: "1 1 280px", minWidth: 220 }}
          >
            <MenuItem value="all">None</MenuItem>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <IconButton
            aria-label="Reset filters"
            onClick={handleResetFilters}
            className="!h-[53px] !w-[60px] !rounded !border !border-[rgba(0,0,0,0.23)] !text-[rgba(0,0,0,0.6)]"
          >
            <FilterAltOutlinedIcon />
          </IconButton>
        </div>

        {filteredData.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#6A7282]">
            No campaigns found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.12)]">
                    {[
                      "Year",
                      "Campaign Title",
                      "Campaign Leader",
                      "$ Raised",
                      "Goal",
                      "Goal Progress",
                      "Status",
                      "",
                    ].map((header, index) => (
                      <th
                        key={header || "actions"}
                        className={`px-4 py-4 text-left text-sm font-bold tracking-[0.17px] text-[rgba(0,0,0,0.87)] ${
                          index === 7 ? "w-10" : "whitespace-nowrap"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((campaign) => {
                    const progress = getGoalProgress(
                      campaign.raised,
                      campaign.goal,
                    );
                    const displayedProgress = Math.min(progress, 100);

                    return (
                      <tr
                        key={campaign.campaign_id}
                        className="cursor-pointer border-b border-[rgba(0,0,0,0.12)] transition-colors hover:bg-[#F9FAFB]"
                        onClick={() =>
                          handleCampaignClick(campaign.campaign_id)
                        }
                      >
                        <td className="px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                          {getCampaignYear(campaign.date_created)}
                        </td>
                        <td className="max-w-[180px] px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                          <span className="block truncate">
                            {campaign.name || "Untitled Campaign"}
                          </span>
                        </td>
                        <td className="max-w-[150px] px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                          <span className="block truncate">
                            {campaign.campaign_leader || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                          {formatCurrency(campaign.raised)}
                        </td>
                        <td className="px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                          {formatCurrency(campaign.goal)}
                        </td>
                        <td className="min-w-[150px] px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-1 min-w-[72px] flex-1 overflow-hidden rounded-full bg-[rgba(25,118,210,0.3)]">
                              <div
                                className="h-full rounded-full bg-[#1976D2]"
                                style={{ width: `${displayedProgress}%` }}
                              />
                            </div>
                            <span className="text-sm text-[rgba(0,0,0,0.87)]">
                              {displayedProgress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusChip status={campaign.status} />
                        </td>
                        <td className="px-2 py-2">
                          <IconButton
                            aria-label={`Open ${campaign.name || "campaign"}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCampaignClick(campaign.campaign_id);
                            }}
                          >
                            <KeyboardArrowRightIcon className="text-[rgba(0,0,0,0.54)]" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-6 px-4 py-3 text-xs tracking-[0.4px] text-[rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPageIndex(0);
                  }}
                  className="bg-transparent text-xs text-[rgba(0,0,0,0.87)] outline-none"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[rgba(0,0,0,0.87)]">
                {firstRow}-{lastRow} of {filteredData.length}
              </span>

              <div className="flex items-center">
                <IconButton
                  aria-label="Previous page"
                  disabled={currentPageIndex === 0}
                  onClick={() =>
                    setPageIndex(() => Math.max(currentPageIndex - 1, 0))
                  }
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <IconButton
                  aria-label="Next page"
                  disabled={currentPageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex(() =>
                      Math.min(currentPageIndex + 1, totalPages - 1),
                    )
                  }
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
