"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  flexRender,
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import Button from "@mui/material/Button";
import { Avatar, Chip, Menu, MenuItem } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import SearchIcon from "@mui/icons-material/Search";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";
import type {
  UserCampaign,
  UsersTableRow,
} from "@/src/types/frontend/usersTable";
import useDeleteUser from "@/src/hooks/users/useDeleteUser";
import type { Status } from "@/src/types/db/enums";
import useIncrementalMobileList from "@/src/hooks/useIncrementalMobileList";

interface Props {
  initialData: UsersTableRow[];
  competitionYearMap: Map<number, number>;
  selectedYear: number;
  currentYear: number;
}

type AggregateStatus = Status | "mixed";
type FilterStatus = Status | "not_started";
type SortField = "first_name" | "last_name" | "email" | "created_at";
type SortDirection = "asc" | "desc";

const STATUS_LABELS: Record<AggregateStatus, string> = {
  in_progress: "In Progress",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  published: "Published",
  publish_failed: "Publish Failed",
  archived: "Archived",
  mixed: "Mixed",
};

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "publish_failed", label: "Publish Failed" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "not_started", label: "Not Started" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "created_at", label: "Date Joined" },
];

function getAggregateStatus(campaigns: UserCampaign[]): AggregateStatus {
  const statuses = new Set(campaigns.map((c) => c.status));
  if (statuses.size === 1) return campaigns[0].status;
  return "mixed";
}

const STATUS_PRIORITY: Status[] = [
  "publish_failed",
  "published",
  "approved",
  "pending",
  "in_progress",
  "archived",
];

function getBestStatus(campaigns: UserCampaign[]): Status {
  const statuses = new Set(campaigns.map((c) => c.status));
  return STATUS_PRIORITY.find((s) => statuses.has(s)) ?? "archived";
}

const APP_STATUS_CONFIG: Record<
  Status,
  { label: string; buttonLabel: string | null }
> = {
  in_progress: { label: "in-progress", buttonLabel: "VIEW APPLICATION" },
  pending: { label: "pending", buttonLabel: "VIEW APPLICATION" },
  approved: { label: "approved", buttonLabel: "VIEW CAMPAIGN" },
  denied: { label: "denied", buttonLabel: "VIEW APPLICATION" },
  published: { label: "published", buttonLabel: "VIEW CAMPAIGN" },
  publish_failed: { label: "publish failed", buttonLabel: null },
  archived: { label: "archived", buttonLabel: "VIEW CAMPAIGN" },
};

const APP_STATUS_ORDER: Status[] = [
  "pending",
  "approved",
  "in_progress",
  "denied",
  "published",
  "publish_failed",
  "archived",
];

function groupByStatus(campaigns: UserCampaign[]) {
  const groups: Partial<Record<Status, UserCampaign[]>> = {};

  for (const campaign of campaigns) {
    if (!groups[campaign.status]) {
      groups[campaign.status] = [];
    }
    groups[campaign.status]!.push(campaign);
  }

  return groups;
}

function getCampaignStatusPath(status: Status, campaignId: number) {
  switch (status) {
    case "pending":
    case "denied":
      return `/dashboard/review-applications/${campaignId}`;
    case "approved":
    case "published":
    case "publish_failed":
    case "archived":
      return `/dashboard/approved-campaigns/${campaignId}`;
    default:
      return null;
  }
}

function formatDateJoined(dateStr?: string) {
  if (!dateStr) return "N/A";
  return dateStr.split("T")[0];
}

function compareValues(
  a: string | undefined,
  b: string | undefined,
  direction: SortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return (a ?? "").localeCompare(b ?? "") * multiplier;
}

function getStatusSummaryText(status: Status, count: number, fullName: string) {
  switch (status) {
    case "pending":
      return `${fullName} has ${count} pending application${count === 1 ? "" : "s"}:`;
    case "approved":
      return `${fullName} has ${count} approved campaign${count === 1 ? "" : "s"}:`;
    case "denied":
      return `${fullName} has ${count} denied application${count === 1 ? "" : "s"}:`;
    case "published":
      return `${fullName} has ${count} published campaign${count === 1 ? "" : "s"}:`;
    case "publish_failed":
      return `${fullName} has ${count} campaign${count === 1 ? "" : "s"} that failed to publish:`;
    case "archived":
      return `${fullName} has ${count} archived campaign${count === 1 ? "" : "s"}:`;
    case "in_progress":
      return `${fullName} has ${count} in-progress application${count === 1 ? "" : "s"}.`;
  }
}

const STATUS_CHIP_STYLES: Record<AggregateStatus, {
  avatarClassName: string;
  chipClassName: string;
}> = {
  publish_failed: {
    avatarClassName: "bg-[#C62828]!",
    chipClassName: "border-[#D32F2F]! text-[#D32F2F]!",
  },
  published: {
    avatarClassName: "bg-[#1B5E20]!",
    chipClassName: "border-[#2E7D32]! text-[#2E7D32]!",
  },
  approved: {
    avatarClassName: "bg-[#1976D2]!",
    chipClassName: "border-[#1976D2]! text-[#1976D2]!",
  },
  pending: {
    avatarClassName: "bg-[#7B1FA2]!",
    chipClassName: "border-[#9C27B0]! text-[#9C27B0]!",
  },
  in_progress: {
    avatarClassName: "bg-[#E65100]!",
    chipClassName: "border-[#EF6C00]! text-[#EF6C00]!",
  },
  denied: {
    avatarClassName: "bg-[#C62828]!",
    chipClassName: "border-[#E53935]! text-[#C62828]!",
  },
  archived: {
    avatarClassName: "bg-[#757575]!",
    chipClassName: "border-[#BDBDBD]! text-[#9E9E9E]!",
  },
  mixed: {
    avatarClassName: "bg-[#757575]!",
    chipClassName: "border-[#BDBDBD]! text-[#9E9E9E]!",
  },
};

function CampaignsSummaryBadge({
  status,
  count,
  onClick,
  bestStatus,
}: {
  status: AggregateStatus;
  count: number;
  onClick?: () => void;
  bestStatus?: Status;
}) {
  const styleStatus = status === "mixed" && bestStatus ? bestStatus : status;
  const styles = STATUS_CHIP_STYLES[styleStatus];

  return (
    <span onClick={onClick} className="cursor-pointer">
      <Chip
        variant="outlined"
        label={STATUS_LABELS[status]}
        {...(count > 1 && {
          avatar: (
            <Avatar
              className={`${styles.avatarClassName} text-white! font-bold! text-xs!`}
            >
              {count}
            </Avatar>
          ),
        })}
        className={`${styles.chipClassName} font-medium! text-sm! cursor-pointer!`}
      />
    </span>
  );
}

const columnHelper = createColumnHelper<UsersTableRow>();

export default function UsersTable({
  initialData,
  competitionYearMap,
  selectedYear,
  currentYear,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [mobileStatusFilters, setMobileStatusFilters] = useState<
    FilterStatus[]
  >([]);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<UsersTableRow | null>(null);
  const [deleteUnlockIn, setDeleteUnlockIn] = useState(0);
  const [statusTarget, setStatusTarget] = useState<UsersTableRow | null>(null);
  const [toast, setToast] = useState(false);
  const { mutate: deleteUserMutate } = useDeleteUser();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!deleteTarget) {
      setDeleteUnlockIn(0);
      return;
    }

    setDeleteUnlockIn(5);

    const timer = window.setInterval(() => {
      setDeleteUnlockIn((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deleteTarget]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget || deleteUnlockIn > 0) return;

    deleteUserMutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setToast(true);
      },
    });
  }, [deleteTarget, deleteUnlockIn, deleteUserMutate]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("first_name", {
        header: "First Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("last_name", {
        header: "Last Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "campaigns",
        header: "Submission Status",
        cell: ({ row }) => {
          const { campaigns } = row.original;
          if (campaigns.length === 0) {
            return (
              <Chip
                variant="outlined"
                label="Not Started"
                className="border-[#BDBDBD]! text-[#9E9E9E]! font-medium! text-sm!"
              />
            );
          }
          const status = getAggregateStatus(campaigns);
          return (
            <CampaignsSummaryBadge
              status={status}
              count={campaigns.length}
              onClick={() => setStatusTarget(row.original)}
              {...(status === "mixed" && {
                bestStatus: getBestStatus(campaigns),
              })}
            />
          );
        },
      }),
      columnHelper.display({
        id: "delete",
        header: "",
        cell: ({ row }) => (
          <span
            className="flex justify-end cursor-pointer"
            onClick={() => setDeleteTarget(row.original)}
          >
            <DeleteIcon
              className="transition-opacity text-[#D32F2F]"
              style={{ opacity: hoveredRowId === row.id ? 1 : 0 }}
            />
          </span>
        ),
      }),
    ],
    [hoveredRowId],
  );

  const yearFilteredData = useMemo(() => {
    return initialData.map((user) => ({
      ...user,
      campaigns: user.campaigns.filter((campaign) => {
        if (!campaign || !campaign.competition_id) return false;
        return competitionYearMap.get(campaign.competition_id) === selectedYear;
      }).map((campaign) => ({
        ...campaign,
        status:
          selectedYear !== currentYear && campaign.status === "approved"
            ? "archived"
            : campaign.status,
      })),
    }));
  }, [currentYear, initialData, competitionYearMap, selectedYear]);

  const activeStatusFilters = useMemo<FilterStatus[]>(() => {
    if (mobileStatusFilters.length) {
      return mobileStatusFilters;
    }

    return statusFilter ? [statusFilter as FilterStatus] : [];
  }, [mobileStatusFilters, statusFilter]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return yearFilteredData.filter((user) => {
      const matchesSearch =
        q.length === 0 ||
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);

      const matchesStatus =
        activeStatusFilters.length === 0 ||
        activeStatusFilters.some((filter) => {
          if (filter === "not_started") {
            return user.campaigns.length === 0;
          }

          return user.campaigns.some((campaign) => campaign.status === filter);
        });

      return matchesSearch && matchesStatus;
    });
  }, [activeStatusFilters, search, yearFilteredData]);

  const sortedData = useMemo(() => {
    const nextData = [...filteredData];

    nextData.sort((a, b) => {
      switch (sortField) {
        case "first_name":
          return compareValues(a.first_name, b.first_name, sortDirection);
        case "last_name":
          return compareValues(a.last_name, b.last_name, sortDirection);
        case "email":
          return compareValues(a.email, b.email, sortDirection);
        case "created_at":
        default:
          return compareValues(a.created_at, b.created_at, sortDirection);
      }
    });

    return nextData;
  }, [filteredData, sortDirection, sortField]);

  const mobileResetKey = [
    selectedYear,
    search,
    statusFilter,
    mobileStatusFilters.join(","),
    sortField,
    sortDirection,
    sortedData.length,
  ].join("|");

  const {
    visibleItems: visibleMobileUsers,
    visibleCount: visibleMobileUserCount,
    hasMore: hasMoreMobileUsers,
    loadMore: loadMoreMobileUsers,
    sentinelRef: mobileUsersSentinelRef,
  } = useIncrementalMobileList(sortedData, {
    initialCount: 12,
    increment: 12,
    resetKey: mobileResetKey,
  });

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const firstRow = sortedData.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, sortedData.length);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleDesktopStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      setMobileStatusFilters([]);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleToggleMobileStatusFilter = useCallback(
    (value: FilterStatus) => {
      setStatusFilter("");
      setMobileStatusFilters((current) => {
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];

        return next;
      });
      table.setPageIndex(0);
    },
    [table],
  );

  const handleSortFieldChange = useCallback(
    (value: SortField) => {
      setSortField(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleSortDirectionChange = useCallback(
    (value: SortDirection) => {
      setSortDirection(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const isSortMenuOpen = Boolean(sortAnchorEl);

  return (
    <div className="w-full">
      <Menu
        anchorEl={filterAnchorEl}
        open={isFilterMenuOpen}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className:
              "mt-2 min-w-[240px] overflow-hidden rounded-[14px] border border-[#eef2ee] shadow-[0_12px_26px_rgba(31,60,44,0.12)]",
          },
        }}
      >
        <div className="border-b border-[#eef2ee] px-5 py-4 text-[16px] font-semibold text-[#1f2320]">
          Submission Status
        </div>
        {FILTER_OPTIONS.map((option) => {
          const isSelected = activeStatusFilters.includes(option.value);

          return (
            <MenuItem
              key={option.value}
              onClick={() => handleToggleMobileStatusFilter(option.value)}
              className="!px-5 !py-3"
            >
              <div className="flex min-w-[200px] items-center justify-between gap-4">
                <span>{option.label}</span>
                {isSelected && <CheckIcon className="!text-[#2D7A45]" />}
              </div>
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={isSortMenuOpen}
        onClose={() => setSortAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className:
              "mt-2 min-w-[240px] overflow-hidden rounded-[14px] border border-[#eef2ee] shadow-[0_12px_26px_rgba(31,60,44,0.12)]",
          },
        }}
      >
        <div className="border-b border-[#eef2ee] px-5 py-4 text-[16px] font-semibold text-[#1f2320]">
          Sort By
        </div>
        {SORT_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortFieldChange(option.value)}
            className="!px-5 !py-3"
          >
            <div className="flex min-w-[200px] items-center justify-between gap-4">
              <span>{option.label}</span>
              {sortField === option.value && (
                <CheckIcon className="!text-[#2D7A45]" />
              )}
            </div>
          </MenuItem>
        ))}
        <div className="border-t border-[#eef2ee] px-5 py-4 text-[16px] font-semibold text-[#1f2320]">
          Sort Direction
        </div>
        <MenuItem
          onClick={() => handleSortDirectionChange("asc")}
          className="!px-5 !py-3"
        >
          <div className="flex min-w-[200px] items-center justify-between gap-4">
            <span>Ascending</span>
            {sortDirection === "asc" && (
              <CheckIcon className="!text-[#2D7A45]" />
            )}
          </div>
        </MenuItem>
        <MenuItem
          onClick={() => handleSortDirectionChange("desc")}
          className="!px-5 !py-3"
        >
          <div className="flex min-w-[200px] items-center justify-between gap-4">
            <span>Descending</span>
            {sortDirection === "desc" && (
              <CheckIcon className="!text-[#2D7A45]" />
            )}
          </div>
        </MenuItem>
      </Menu>

      <div className="overflow-hidden rounded-xl bg-white md:mx-auto md:w-full md:overflow-x-auto">
        <div className="px-4 pt-5 md:hidden">
          <div className="text-sm text-[#1f2320]">
            <span className="font-semibold">User List</span> -{" "}
            {sortedData.length} User
            {sortedData.length === 1 ? "" : "s"}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="relative block flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 !h-7 !w-7 -translate-y-1/2 text-[#666666]" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search"
                className="h-12 w-full rounded-[10px] border border-[#C8D0C8] bg-white pl-14 pr-4 text-[16px] text-[#1f2320] outline-none placeholder:text-[#818881]"
              />
            </label>

            <button
              type="button"
              onClick={(event) => setFilterAnchorEl(event.currentTarget)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#C8D0C8] bg-white text-[#666666] shadow-[0_4px_10px_rgba(31,60,44,0.08)]"
              aria-label="Filter users"
            >
              <FilterAltOutlinedIcon className="!h-7 !w-7" />
            </button>

            <button
              type="button"
              onClick={(event) => setSortAnchorEl(event.currentTarget)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#C8D0C8] bg-white text-[#666666] shadow-[0_4px_10px_rgba(31,60,44,0.08)]"
              aria-label="Sort users"
            >
              <ImportExportIcon className="!h-7 !w-7" />
            </button>
          </div>

          <div className="mt-6 border-b border-[#CFD8CF]" />
        </div>

        <div className="hidden px-5 pt-8 md:block">
          <h2 className="font-bold text-black sm:text-left text-center">
            {selectedYear} User List
          </h2>
          <p className="text-sm text-gray-500 sm:text-left text-center">
            {sortedData.length} Users
          </p>

          <div className="my-6 flex gap-4">
            <div className="relative flex-1">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
                Search
              </label>
              <div className="flex items-center rounded-lg border border-gray-400 px-3 py-2.5 transition-colors focus-within:border-blue-500">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Name, email, etc..."
                  className="w-full bg-transparent text-md outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
                  Filter By Submission Status
                </label>
                <div className="flex items-center rounded-lg border border-gray-400 px-3 py-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleDesktopStatusChange(e.target.value)}
                    className="w-full cursor-pointer appearance-none bg-transparent text-md text-gray-500 outline-none"
                  >
                    <option value="">No Filter</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="published">Published</option>
                    <option value="publish_failed">Publish Failed</option>
                    <option value="archived">Archived</option>
                    <option value="not_started">Not Started</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block px-4 py-5 md:hidden">
          {sortedData.length === 0 ? (
            <div className="rounded-[18px] border border-[#DFE8DF] bg-white px-5 py-8 text-center text-sm text-[#8a918b] shadow-[0_8px_20px_rgba(31,60,44,0.05)]">
              No users found.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleMobileUsers.map((user) => {
                const aggregateStatus =
                  user.campaigns.length === 0
                    ? null
                    : getAggregateStatus(user.campaigns);

                return (
                  <div
                    key={user.id}
                    className="overflow-hidden rounded-[18px] border border-[#DFE8DF] bg-white shadow-[0_8px_20px_rgba(31,60,44,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="text-[13px] text-[#7B827D]">
                          First Name:
                        </p>
                        <p className="mt-1 text-[18px] font-semibold text-[#1f2320]">
                          {user.first_name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="text-[#E53935]"
                        aria-label={`Delete ${user.first_name} ${user.last_name}`}
                      >
                        <DeleteIcon />
                      </button>
                    </div>

                    <div className="border-t border-[#CFD8CF] px-5 py-4">
                      <div className="flex items-center justify-between gap-4 border-b border-[#E3E8E3] py-3 text-[14px]">
                        <span className="text-[#6A706B]">Last Name</span>
                        <span className="font-medium text-[#1f2320]">
                          {user.last_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-[#E3E8E3] py-3 text-[14px]">
                        <span className="text-[#6A706B]">Email</span>
                        <span className="truncate pl-3 font-medium text-[#1f2320]">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-[#E3E8E3] py-3 text-[14px]">
                        <span className="text-[#6A706B]">Date Joined</span>
                        <span className="font-medium text-[#1f2320]">
                          {formatDateJoined(user.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-3 text-[14px]">
                        <span className="text-[#6A706B]">
                          Submission Status
                        </span>
                        {aggregateStatus ? (
                          <CampaignsSummaryBadge
                            status={aggregateStatus}
                            count={user.campaigns.length}
                            onClick={() => setStatusTarget(user)}
                            {...(aggregateStatus === "mixed" && {
                              bestStatus: getBestStatus(user.campaigns),
                            })}
                          />
                        ) : (
                          <Chip
                            variant="outlined"
                            label="Not Started"
                            className="border-[#BDBDBD]! text-[#9E9E9E]! font-medium! text-sm!"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden md:block">
          {sortedData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-b border-gray-300 px-5 py-4 text-left font-semibold text-gray-800"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="border-b border-gray-300 px-5 py-4 text-left"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-end gap-6 border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="cursor-pointer font-medium text-gray-700 outline-none"
                  >
                    {[5, 10, 20].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <span>
                  {firstRow}-{lastRow} of {sortedData.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-1 text-2xl font-bold text-black disabled:opacity-30"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-1 text-2xl font-bold text-black disabled:opacity-30"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {sortedData.length > 0 && (
        <div className="px-4 pb-20 text-[12px] text-[#7B827D] md:hidden">
          <div className="flex flex-col items-center gap-3">
            <span>
              Showing {visibleMobileUserCount} of {sortedData.length}
            </span>
            {hasMoreMobileUsers && (
              <>
                <div ref={mobileUsersSentinelRef} className="h-1 w-full" />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadMoreMobileUsers}
                >
                  Load More
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <BaseModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={undefined}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-semibold text-[#123A1E]">
            Confirm Deletion
          </h2>
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="text-[#666666] transition-colors hover:text-[#1f2320]"
            aria-label="Close delete dialog"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="mb-8 text-gray-700">
          You are about to delete {deleteTarget?.first_name}{" "}
          {deleteTarget?.last_name}&apos;s account. This action is irreversible.
          Are you sure you would like to delete their account?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setDeleteTarget(null)}
            className="cursor-pointer px-4 py-2 font-medium text-gray-600 transition-colors hover:text-gray-800"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleteUnlockIn > 0}
            className={clsx(
              "rounded px-5 py-2 font-medium transition-colors",
              deleteUnlockIn > 0
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "cursor-pointer bg-red-600 text-white hover:bg-red-700",
            )}
          >
            DELETE
          </button>
        </div>
      </BaseModal>

      {statusTarget &&
        (() => {
          const groups = groupByStatus(statusTarget.campaigns);
          const fullName = `${statusTarget.first_name} ${statusTarget.last_name}`;

          return (
            <BaseModal
              open={true}
              onClose={() => setStatusTarget(null)}
              title={undefined}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <h2 className="text-[20px] font-semibold text-[#123A1E]">
                  Submission Status
                </h2>
                <button
                  type="button"
                  onClick={() => setStatusTarget(null)}
                  className="text-[#666666] transition-colors hover:text-[#1f2320]"
                  aria-label="Close application status dialog"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="max-h-[50vh] flex-1 overflow-y-auto">
                {APP_STATUS_ORDER.filter((status) => groups[status]).map(
                  (status) => {
                    const campaigns = groups[status]!;
                    const config = APP_STATUS_CONFIG[status];

                    return (
                      <div key={status} className="mb-5 last:mb-0">
                        <p className="mb-3 text-gray-800">
                          {getStatusSummaryText(
                            status,
                            campaigns.length,
                            fullName,
                          )}
                        </p>
                        {status !== "in_progress" && (
                          <div className="flex flex-col gap-3 pl-4">
                            {campaigns.map((campaign) => (
                              <div
                                key={campaign.campaign_id}
                                className="flex items-center justify-between gap-4"
                              >
                                <span className="text-gray-700">
                                  {campaign.name}
                                </span>
                                {config.buttonLabel && (
                                  <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={() => {
                                      const path = getCampaignStatusPath(
                                        status,
                                        campaign.campaign_id,
                                      );

                                      if (!path) {
                                        return;
                                      }

                                      setStatusTarget(null);
                                      router.push(path);
                                    }}
                                  >
                                    {config.buttonLabel}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </BaseModal>
          );
        })()}

      <BaseAlert
        open={toast}
        onClose={() => setToast(false)}
        title="Account has been deleted!"
      />
    </div>
  );
}
