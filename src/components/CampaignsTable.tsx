"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImportExportOutlinedIcon from "@mui/icons-material/ImportExportOutlined";
import { useRouter } from "next/navigation";
import type { Status } from "@/src/types/db/enums";
import { CampaignWithLeader } from "@/src/types/frontend/campaignsTable";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "../hooks/users/useUserByAuthId";
import useIncrementalMobileList from "@/src/hooks/useIncrementalMobileList";

interface Props {
  initialData: CampaignWithLeader[];
  pageTitle?: string;
  pageListLabel?: string;
  useFilterMenu?: boolean;
  desktopFilterMode?: "year" | "status";
  filterStatusLabelMap?: Partial<Record<Status, string>>;
  statusOptionsOverride?: Status[];
  statusSortPriority?: Status[];
  desktopSearchPlaceholder?: string;
  showDesktopResetButton?: boolean;
  hideYearColumn?: boolean;
  statusColumnLabel?: string;
  adminRouteResolver?: (campaign: CampaignWithLeader) => string;
}

const pageSizeOptions = [5, 10, 20];
type MobileFilterCategory = "year" | "status";

const statusLabels: Partial<Record<Status, string>> = {
  in_progress: "Draft",
  publish_failed: "Publish Failed",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  published: "Published",
  archived: "Archived",
};

function getStatusLabel(status: string) {
  return statusLabels[status as Status] ?? status;
}

function getFilterStatusLabel(
  status: string,
  filterStatusLabelMap?: Partial<Record<Status, string>>,
) {
  return filterStatusLabelMap?.[status as Status] ?? getStatusLabel(status);
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
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.round(((raised ?? 0) / goal) * 100));
}

function getStatusChipClasses(status: string) {
  switch (status) {
    case "publish_failed":
      return "border-[#F04438] text-[#F04438]";
    case "approved":
    case "published":
      return "border-[#2D7A45] text-[#2D7A45]";
    case "pending":
      return "border-[#F79009] text-[#B54708]";
    case "denied":
      return "border-[#F04438] text-[#F04438]";
    case "in_progress":
      return "border-[#1570EF] text-[#1570EF]";
    default:
      return "border-[#98A2B3] text-[#667085]";
  }
}

function StatusChip({ status }: { status: string }) {
  return <Chip variant={status as Status} label={getStatusLabel(status)} />;
}

export default function CampaignsTable({
  initialData,
  pageTitle = "Campaigns",
  pageListLabel = `${pageTitle} List`,
  useFilterMenu = false,
  desktopFilterMode = "year",
  filterStatusLabelMap,
  statusOptionsOverride,
  statusSortPriority = [],
  desktopSearchPlaceholder,
  showDesktopResetButton = true,
  hideYearColumn = false,
  statusColumnLabel = "Status",
  adminRouteResolver,
}: Props) {
  const router = useRouter();
  const [campaignSearch, setCampaignSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isAscending, setIsAscending] = useState(false);
  const [filterCategoryAnchorEl, setFilterCategoryAnchorEl] =
    useState<HTMLElement | null>(null);
  const [filterValueAnchorEl, setFilterValueAnchorEl] =
    useState<HTMLElement | null>(null);
  const [activeMobileFilter, setActiveMobileFilter] =
    useState<MobileFilterCategory | null>(null);
  const [mobileFilterOpenedFromChip, setMobileFilterOpenedFromChip] =
    useState(false);

  const { user } = useAuth();
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserByAuthId(user?.id || "");

  const years = useMemo(
    () =>
      [
        ...new Set(
          (initialData ?? []).map((c) => getCampaignYear(c.date_created)),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [initialData],
  );

  const filteredData = useMemo(() => {
    const normalizedSearch = campaignSearch.trim().toLowerCase();
    const filtered = (initialData ?? []).filter((campaign) => {
      const campaignYear = getCampaignYear(campaign.date_created);
      const matchesDesktopYear =
        desktopFilterMode !== "year" ||
        yearFilter === "all" || campaignYear === yearFilter;
      if (!matchesDesktopYear) return false;

      const matchesDesktopStatus =
        desktopFilterMode !== "status" ||
        statusFilter === "all" ||
        campaign.status === statusFilter;
      if (!matchesDesktopStatus) return false;

      const matchesSelectedYears =
        selectedYears.length === 0 || selectedYears.includes(campaignYear);
      if (!matchesSelectedYears) return false;

      const matchesSelectedStatuses =
        selectedStatuses.length === 0 || selectedStatuses.includes(campaign.status);
      if (!matchesSelectedStatuses) return false;

      if (!normalizedSearch) return true;
      return (
        campaign.name.toLowerCase().includes(normalizedSearch) ||
        campaign.campaign_leader.toLowerCase().includes(normalizedSearch) ||
        getFilterStatusLabel(
          campaign.status,
          filterStatusLabelMap,
        ).toLowerCase().includes(normalizedSearch)
      );
    });

    if (statusSortPriority.length === 0) {
      return filtered;
    }

    const priorityMap = new Map(
      statusSortPriority.map((status, index) => [status, index]),
    );

    return filtered
      .map((campaign, index) => ({ campaign, index }))
      .sort((a, b) => {
        const aPriority = priorityMap.get(a.campaign.status as Status);
        const bPriority = priorityMap.get(b.campaign.status as Status);

        if (aPriority !== undefined || bPriority !== undefined) {
          if (aPriority === undefined) return 1;
          if (bPriority === undefined) return -1;
          if (aPriority !== bPriority) return aPriority - bPriority;
        }

        return a.index - b.index;
      })
      .map(({ campaign }) => campaign);
  }, [
    campaignSearch,
    desktopFilterMode,
    filterStatusLabelMap,
    initialData,
    selectedStatuses,
    selectedYears,
    statusSortPriority,
    statusFilter,
    yearFilter,
  ]);

  const statusOptions = useMemo(
    () =>
      (statusOptionsOverride?.length
        ? statusOptionsOverride
        : [...new Set((initialData ?? []).map((campaign) => campaign.status))])
        .map((status) => status as Status)
        .sort((a, b) =>
          getFilterStatusLabel(a, filterStatusLabelMap).localeCompare(
            getFilterStatusLabel(b, filterStatusLabelMap),
          ),
        ),
    [filterStatusLabelMap, initialData, statusOptionsOverride],
  );

  const mobileFilteredData = useMemo(() => {
    const data = filteredData.filter((campaign) => {
      const matchesYears =
        selectedYears.length === 0 ||
        selectedYears.includes(getCampaignYear(campaign.date_created));
      const matchesStatuses =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(campaign.status);

      return matchesYears && matchesStatuses;
    });

    return [...data].sort((a, b) => {
      const aValue = new Date(a.date_created).valueOf();
      const bValue = new Date(b.date_created).valueOf();
      return isAscending ? aValue - bValue : bValue - aValue;
    });
  }, [filteredData, isAscending, selectedStatuses, selectedYears]);

  const mobileResetKey = [
    campaignSearch,
    statusFilter,
    yearFilter,
    selectedYears.join(","),
    selectedStatuses.join(","),
    isAscending ? "asc" : "desc",
    mobileFilteredData.length,
  ].join("|");

  const {
    visibleItems: visibleMobileCampaigns,
    visibleCount: visibleMobileCampaignCount,
    hasMore: hasMoreMobileCampaigns,
    loadMore: loadMoreMobileCampaigns,
    sentinelRef: mobileCampaignsSentinelRef,
  } = useIncrementalMobileList(mobileFilteredData, {
    initialCount: 12,
    increment: 12,
    resetKey: mobileResetKey,
  });

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

  if (isLoadingUser) return null;
  if (userError || !userData) throw new Error("Unauthorized");

  const handleCampaignClick = (campaignId: number) => {
    const campaign = initialData.find((item) => item.campaign_id === campaignId);
    const path =
      userData.is_admin && campaign && adminRouteResolver
        ? adminRouteResolver(campaign)
        : userData.is_admin
          ? `/dashboard/approved-campaigns/${campaignId}`
          : `/dashboard/${campaignId}`;
    router.push(path);
  };

  const handleResetFilters = () => {
    setCampaignSearch("");
    setYearFilter("all");
    setStatusFilter("all");
    setPageIndex(0);
  };

  const closeMobileFilterMenus = () => {
    setFilterCategoryAnchorEl(null);
    setFilterValueAnchorEl(null);
    setActiveMobileFilter(null);
    setMobileFilterOpenedFromChip(false);
  };

  const openMobileFilterValues = (
    category: MobileFilterCategory,
    anchorEl: HTMLElement,
    openedFromChip = false,
  ) => {
    setActiveMobileFilter(category);
    setFilterCategoryAnchorEl(null);
    setFilterValueAnchorEl(anchorEl);
    setMobileFilterOpenedFromChip(openedFromChip);
  };

  const toggleMobileFilterValue = (
    category: MobileFilterCategory,
    value: string,
  ) => {
    if (category === "year") {
      setSelectedYears((current) =>
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value].sort((a, b) => Number(b) - Number(a)),
      );
      return;
    }

    setSelectedStatuses((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value].sort((a, b) =>
            getFilterStatusLabel(a, filterStatusLabelMap).localeCompare(
              getFilterStatusLabel(b, filterStatusLabelMap),
            ),
          ),
    );
  };

  const clearMobileFilterCategory = (category: MobileFilterCategory) => {
    if (category === "year") {
      setSelectedYears([]);
    } else {
      setSelectedStatuses([]);
    }
  };

  const mobileFilterOptions =
    activeMobileFilter === "year"
      ? years
      : activeMobileFilter === "status"
        ? statusOptions
        : [];

  const selectedMobileFilterValues =
    activeMobileFilter === "year"
      ? selectedYears
      : activeMobileFilter === "status"
        ? selectedStatuses
        : [];

  const formatMobileFilterChipLabel = (
    category: MobileFilterCategory,
    values: string[],
  ) => {
    if (category === "year") {
      return `Year: ${values.join(", ")}`;
    }

    return `Status: ${values
      .map((value) => getFilterStatusLabel(value, filterStatusLabelMap))
      .join(", ")}`;
  };

  return (
    <div className="w-full">
      <div className="md:hidden">
        <div className="sticky top-0 z-10 -mx-4 bg-[#F6FAF9] px-4 pb-4 pt-2">
          <h2 className="text-[20px] font-bold leading-[1.35] text-[#123A1E]">
            {pageTitle}
          </h2>
          <p className="mt-2 text-[14px] text-[#667085]">
            <span className="font-bold text-[#101828]">{pageListLabel}</span>
            {` - ${initialData.length} Campaign${initialData.length === 1 ? "" : "s"}`}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <TextField
              placeholder="Search"
              size="small"
              fullWidth
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon className="text-[#667085]" />
                  </InputAdornment>
                ),
              }}
              className="bg-white"
            />
            <IconButton
              aria-label="Open filters"
              onClick={(event) =>
                setFilterCategoryAnchorEl(event.currentTarget)
              }
              className="!h-10 !w-10 !rounded-[4px] !border !border-[#D0D5DD] !bg-white !text-[#667085]"
            >
              <FilterAltOutlinedIcon />
            </IconButton>
            <IconButton
              aria-label="Toggle sort order"
              onClick={() => setIsAscending((current) => !current)}
              className="!h-10 !w-10 !rounded-[4px] !border !border-[#D0D5DD] !bg-white !text-[#667085]"
            >
              <ImportExportOutlinedIcon />
            </IconButton>
          </div>

          {(selectedYears.length > 0 || selectedStatuses.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedYears.length > 0 && (
                <button
                  type="button"
                  onClick={(event) =>
                    openMobileFilterValues("year", event.currentTarget, true)
                  }
                  className="rounded-full border border-[#2E90FA] bg-white px-3 py-1 text-xs font-medium text-[#2E90FA]"
                >
                  {formatMobileFilterChipLabel("year", selectedYears)}
                </button>
              )}
              {selectedStatuses.length > 0 && (
                <button
                  type="button"
                  onClick={(event) =>
                    openMobileFilterValues("status", event.currentTarget, true)
                  }
                  className="rounded-full border border-[#2E90FA] bg-white px-3 py-1 text-xs font-medium text-[#2E90FA]"
                >
                  {formatMobileFilterChipLabel("status", selectedStatuses)}
                </button>
              )}
            </div>
          )}

          <div className="mt-4 border-b border-[#D0D5DD]" />
        </div>

        <div className="space-y-4 pb-24 pt-4">
          {mobileFilteredData.length === 0 ? (
            <div className="rounded-2xl border border-[#EAECF0] bg-white px-4 py-12 text-center text-sm text-[#6A7282]">
              No campaigns found.
            </div>
          ) : (
            visibleMobileCampaigns.map((campaign) => {
              const displayedProgress = Math.min(
                getGoalProgress(campaign.raised, campaign.goal),
                100,
              );

              return (
                <div
                  key={campaign.campaign_id}
                  className="overflow-hidden rounded-[16px] border border-[#DFE8DF] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4 px-4 py-4">
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#7B827D]">
                        Campaign Title:
                      </p>
                      <p className="mt-1 truncate text-[15px] font-bold leading-6 text-[#101828]">
                        {campaign.name || "Untitled Campaign"}
                      </p>
                    </div>
                    <Button
                      variant="outlined"
                      onClick={() => handleCampaignClick(campaign.campaign_id)}
                      className="!min-w-0 !shrink-0 !rounded-[8px] !border-[#123A1E] !px-4 !py-1.5 !text-[14px] !font-bold !text-[#123A1E]"
                    >
                      View
                    </Button>
                  </div>

                  {[
                    {
                      label: "Year",
                      value: getCampaignYear(campaign.date_created),
                    },
                    {
                      label: "Campaign Leader",
                      value: campaign.campaign_leader || "N/A",
                    },
                    {
                      label: "$ Raised",
                      value: formatCurrency(campaign.raised),
                    },
                    {
                      label: "Goal",
                      value: formatCurrency(campaign.goal),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 border-t border-[#EAECF0] px-4 py-3"
                    >
                      <span className="text-[13px] text-[#667085]">
                        {item.label}
                      </span>
                      <span className="text-[14px] text-[#101828]">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between gap-4 border-t border-[#EAECF0] px-4 py-3">
                    <span className="text-[13px] text-[#667085]">
                      Goal Progress
                    </span>
                    <div className="flex w-[46%] min-w-[120px] items-center gap-2">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#B2D1FF]">
                        <div
                          className="h-full rounded-full bg-[#1570EF]"
                          style={{ width: `${displayedProgress}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-[#344054]">
                        {displayedProgress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[#EAECF0] px-4 py-3">
                    <span className="text-[13px] text-[#667085]">Status</span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[12px] font-medium ${getStatusChipClasses(campaign.status)}`}
                    >
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {mobileFilteredData.length > 0 && (
            <div className="pt-2 text-center text-[12px] text-[#667085]">
              Showing {visibleMobileCampaignCount} of{" "}
              {mobileFilteredData.length}
            </div>
          )}

          {hasMoreMobileCampaigns && (
            <div className="flex flex-col items-center gap-3 pt-1">
              <div ref={mobileCampaignsSentinelRef} className="h-1 w-full" />
              <Button
                variant="outlined"
                size="small"
                onClick={loadMoreMobileCampaigns}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      <Menu
        anchorEl={filterCategoryAnchorEl}
        open={Boolean(filterCategoryAnchorEl)}
        onClose={() => setFilterCategoryAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: "!mt-2 !w-[160px] !rounded-[8px]" } }}
      >
        <div className="px-4 pb-2 pt-4 text-[14px] font-semibold text-[#344054]">
          Filter By
        </div>
        <MenuItem
          onClick={() => {
            if (filterCategoryAnchorEl) {
              openMobileFilterValues("year", filterCategoryAnchorEl);
            }
          }}
        >
          Year
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (filterCategoryAnchorEl) {
              openMobileFilterValues("status", filterCategoryAnchorEl);
            }
          }}
        >
          Status
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={filterValueAnchorEl}
        open={Boolean(filterValueAnchorEl && activeMobileFilter)}
        onClose={closeMobileFilterMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { className: "!mt-2 !min-w-[164px] !rounded-[8px]" },
        }}
      >
        {activeMobileFilter
          ? [
              <div
                key="mobile-filter-header"
                className="flex items-center gap-2 px-3 pb-2 pt-3"
              >
                {!mobileFilterOpenedFromChip && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilterValueAnchorEl(null);
                      setMobileFilterOpenedFromChip(false);
                      if (filterValueAnchorEl) {
                        setFilterCategoryAnchorEl(filterValueAnchorEl);
                      }
                    }}
                    className="!text-[#344054]"
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                )}
                <span className="flex-1 text-[14px] font-semibold text-[#344054]">
                  {activeMobileFilter === "year"
                    ? "Select Year"
                    : "Select Status"}
                </span>
                <IconButton
                  size="small"
                  onClick={() => clearMobileFilterCategory(activeMobileFilter)}
                  className="!text-[#F04438]"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </div>,
              ...mobileFilterOptions.map((option) => {
                const optionValue = String(option);
                const isSelected =
                  selectedMobileFilterValues.includes(optionValue);

                return (
                  <MenuItem
                    key={optionValue}
                    onClick={() =>
                      toggleMobileFilterValue(activeMobileFilter, optionValue)
                    }
                    className="!flex !items-center !justify-between !gap-3"
                  >
                    <span>
                      {activeMobileFilter === "status"
                        ? getFilterStatusLabel(optionValue, filterStatusLabelMap)
                        : optionValue}
                    </span>
                    {isSelected && <CheckIcon className="!text-[#2D7A45]" />}
                  </MenuItem>
                );
              }),
            ]
          : null}
      </Menu>

      <div className="hidden overflow-hidden rounded-2xl border border-[#EAECF0] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.05)] md:block">
        <div className="px-4 pt-6">
          <h2 className="text-[16px] font-bold leading-6 text-[rgba(0,0,0,0.87)]">
            {pageListLabel}
          </h2>
          <p className="mt-1 text-sm text-[#6A7282]">
            {initialData.length} Campaign{initialData.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-4 pb-4 pt-6">
          <TextField
            label="Search"
            placeholder={
              desktopSearchPlaceholder ??
              (useFilterMenu
                ? "Name, email, etc..."
                : "Search by title or name")
            }
            variant="outlined"
            fullWidth
            value={campaignSearch}
            onChange={(e) => {
              setCampaignSearch(e.target.value);
              setPageIndex(0);
            }}
            sx={{ flex: "1 1 320px", minWidth: 220 }}
          />
          {useFilterMenu ? (
            <IconButton
              aria-label="Open filters"
              onClick={(event) => setFilterCategoryAnchorEl(event.currentTarget)}
              className="!h-[53px] !w-[60px] !rounded !border !border-[rgba(0,0,0,0.23)] !text-[rgba(0,0,0,0.6)]"
            >
              <FilterAltOutlinedIcon />
            </IconButton>
          ) : (
            <>
              {desktopFilterMode === "status" ? (
                <TextField
                  select
                  label="Filter By Website Status"
                  variant="outlined"
                  fullWidth
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPageIndex(0);
                  }}
                  sx={{ flex: "1 1 280px", minWidth: 220 }}
                >
                  <MenuItem value="all">None</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getFilterStatusLabel(status, filterStatusLabelMap)}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  select
                  label="Filter By Year"
                  variant="outlined"
                  fullWidth
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
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
              )}
              {showDesktopResetButton && (
                <IconButton
                  aria-label="Reset filters"
                  onClick={handleResetFilters}
                  className="!h-[53px] !w-[60px] !rounded !border !border-[rgba(0,0,0,0.23)] !text-[rgba(0,0,0,0.6)]"
                >
                  <FilterAltOutlinedIcon />
                </IconButton>
              )}
            </>
          )}
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
                      !hideYearColumn ? "Year" : null,
                      "Campaign Title",
                      "Campaign Leader",
                      "$ Raised",
                      "Goal",
                      "Goal Progress",
                      statusColumnLabel,
                      "",
                    ]
                      .filter((header) => header !== null)
                      .map((header, index, headers) => (
                      <th
                        key={header || "actions"}
                        className={`px-4 py-4 text-left text-sm font-bold tracking-[0.17px] text-[rgba(0,0,0,0.87)] ${index === headers.length - 1 ? "w-10" : "whitespace-nowrap"}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((campaign) => {
                    const displayedProgress = Math.min(
                      getGoalProgress(campaign.raised, campaign.goal),
                      100,
                    );
                    return (
                      <tr
                        key={campaign.campaign_id}
                        className="cursor-pointer border-b border-[rgba(0,0,0,0.12)] transition-colors hover:bg-[#F9FAFB]"
                        onClick={() =>
                          handleCampaignClick(campaign.campaign_id)
                        }
                      >
                        {!hideYearColumn && (
                          <td className="px-4 py-4 text-sm text-[rgba(0,0,0,0.87)]">
                            {getCampaignYear(campaign.date_created)}
                          </td>
                        )}
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
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
                    setPageIndex(Math.max(currentPageIndex - 1, 0))
                  }
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
                <IconButton
                  aria-label="Next page"
                  disabled={currentPageIndex >= totalPages - 1}
                  onClick={() =>
                    setPageIndex(Math.min(currentPageIndex + 1, totalPages - 1))
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
