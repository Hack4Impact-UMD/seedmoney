"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import SearchIcon from "@mui/icons-material/Search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button, FormControlLabel, Menu, MenuItem, Switch } from "@mui/material";
import BaseAlert from "@/src/components/bases/BaseAlert";
import BaseModal from "@/src/components/bases/BaseModal";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import type { Status } from "@/src/types/db/enums";
import { ReviewApplicationRow } from "@/src/types/frontend/campaignsTable";
import { createGivebutterCampaigns } from "../actions/givebutter/campaignsGivebutter";
import useIncrementalMobileList from "@/src/hooks/useIncrementalMobileList";
import { sendCampaignEmailWithLogs } from "@/src/lib/email/sendCampaignEmail";

const pageSizeOptions = [5, 10, 20];

type TabStatus = "PENDING" | "DENIED";
type ReviewAction = "APPROVE" | "DENY" | "REVERT";
type SortKey = "submissionDate" | "campaignTitle" | "campaignLeader";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${month}/${day}/${year}`;
};

interface Props {
  applications: ReviewApplicationRow[];
  isApplicationOpen: boolean;
  isTogglingApplication: boolean;
  onToggleApplication: () => void;
}

export default function ReviewApplicationsTable({
  applications,
  isApplicationOpen,
  isTogglingApplication,
  onToggleApplication,
}: Props) {
  const [tab, setTab] = useState<TabStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("submissionDate");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [pendingToggle, setPendingToggle] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    action: "approved" | "denied" | "reverted" | "error";
    campaignNames: string[];
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const updateCampaignMutation = useUpdateCampaign();

  const clearActionSearchParams = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("action");
    nextSearchParams.delete("campaign");
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, router, searchParams]);

  const queryNotification = useMemo(() => {
    const action = searchParams.get("action");
    const campaignName = searchParams.get("campaign");

    if (!action || !campaignName) return null;
    if (action !== "approved" && action !== "denied" && action !== "reverted") return null;

    return {
      action,
      campaignNames: [campaignName],
    } satisfies {
      action: "approved" | "denied" | "reverted";
      campaignNames: string[];
    };
  }, [searchParams]);

  const activeNotification = notification ?? queryNotification;
  const isAlertOpen = snackbarOpen || queryNotification !== null;

  useEffect(() => {
    if (!isAlertOpen) return;
    const timer = setTimeout(() => {
      setSnackbarOpen(false);
      setNotification(null);
      clearActionSearchParams();
    }, 4000);
    return () => clearTimeout(timer);
  }, [isAlertOpen, clearActionSearchParams]);

  const pendingCount = useMemo(
    () => applications.filter((a) => a.status === "pending").length,
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const dbStatus = tab === "PENDING" ? "pending" : "denied";
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      if (application.status !== dbStatus) return false;
      if (!normalizedQuery) return true;
      return (
        application.campaignTitle.toLowerCase().includes(normalizedQuery) ||
        application.campaignLeader.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [applications, searchQuery, tab]);

  const sortedApplications = useMemo(() => {
    const nextApplications = [...filteredApplications];

    nextApplications.sort((a, b) => {
      if (sortBy === "submissionDate") {
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      }
      if (sortBy === "campaignTitle") {
        return a.campaignTitle.localeCompare(b.campaignTitle);
      }
      return a.campaignLeader.localeCompare(b.campaignLeader);
    });

    return nextApplications;
  }, [filteredApplications, sortBy]);

  const mobileResetKey = [tab, searchQuery, sortBy, sortedApplications.length].join("|");

  const {
    visibleItems: visibleMobileApplications,
    visibleCount: visibleMobileApplicationCount,
    hasMore: hasMoreMobileApplications,
    loadMore: loadMoreMobileApplications,
    sentinelRef: mobileApplicationsSentinelRef,
  } = useIncrementalMobileList(sortedApplications, {
    initialCount: 12,
    increment: 12,
    resetKey: mobileResetKey,
  });

  const totalPages = Math.max(1, Math.ceil(sortedApplications.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);
  const paginatedApplications = useMemo(() => {
    const start = currentPageIndex * pageSize;
    return sortedApplications.slice(start, start + pageSize);
  }, [currentPageIndex, pageSize, sortedApplications]);

  const firstRow = sortedApplications.length === 0 ? 0 : currentPageIndex * pageSize + 1;
  const lastRow = Math.min((currentPageIndex + 1) * pageSize, sortedApplications.length);
  const selectedApplications = applications.filter((application) =>
    selectedIds.includes(application.campaignId),
  );

  const handleBulkUpdate = async (ids: number[], status: Status) => {
    try {
      const names = selectedApplications.map((a) => a.campaignTitle);

      await Promise.all(
        ids.map((id) =>
          updateCampaignMutation.mutateAsync({
            campaignId: id,
            campaignData: { status },
          }),
        ),
      );

      if (status === "approved") {
        const results = await createGivebutterCampaigns(ids);
        const failedCampaignIds: number[] = [];
        const successfulCampaignUpdates: { campaignId: number; update: Promise<unknown> }[] = [];

        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Failed to create Givebutter campaign:", result.reason);
            return;
          }

          const campaignId = result.value.campaignId;
          successfulCampaignUpdates.push({
            campaignId,
            update: updateCampaignMutation.mutateAsync({
              campaignId,
              campaignData: {
                givebutter_id: result.value.id,
                givebutter_slug: result.value.slug,
                givebutterlink: result.value.url,
              },
            }),
          });
        });

        const successfulCampaignIds = new Set(
          results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value.campaignId),
        );

        failedCampaignIds.push(...ids.filter((id) => !successfulCampaignIds.has(id)));

        if (failedCampaignIds.length > 0) {
          await Promise.all(
            failedCampaignIds.map((id) =>
              updateCampaignMutation.mutateAsync({
                campaignId: id,
                campaignData: { status: "publish_failed" },
              }),
            ),
          );
        }

        const successfulUpdateResults = await Promise.allSettled(
          successfulCampaignUpdates.map(({ update }) => update),
        );
        const failedSuccessfulUpdateIds = successfulUpdateResults.flatMap((result, index) =>
          result.status === "rejected" ? [successfulCampaignUpdates[index].campaignId] : [],
        );

        failedCampaignIds.push(...failedSuccessfulUpdateIds);

        if (failedSuccessfulUpdateIds.length > 0) {
          await Promise.allSettled(
            failedSuccessfulUpdateIds.map((id) =>
              updateCampaignMutation.mutateAsync({
                campaignId: id,
                campaignData: { status: "publish_failed" },
              }),
            ),
          );
        }

        if (failedCampaignIds.length > 0) {
          setNotification({ action: "error", campaignNames: [] });
          setSnackbarOpen(true);
          setSelectedIds([]);
          setPendingAction(null);
          await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
          return;
        }
      }

      if (status === "approved" || status === "denied") {
        const emailType =
          status === "approved" ? "campaign_approved" : "campaign_denied";
        const emailResults = await Promise.allSettled(
          ids.map((campaignId) =>
            sendCampaignEmailWithLogs({
              type: emailType,
              campaignId,
              context: "bulk-review-applications-table",
            }),
          ),
        );

        emailResults.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `Error sending ${emailType} email for campaign ${ids[index]}:`,
              result.reason,
            );
            return;
          }

          if (result.value.error) {
            console.error(
              `Error sending ${emailType} email for campaign ${ids[index]}:`,
              result.value.error,
            );
          }
        });
      }

      const action =
        status === "approved" ? "approved" : status === "denied" ? "denied" : "reverted";
      setNotification({ action, campaignNames: names });
      setSnackbarOpen(true);
      setSelectedIds([]);
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (error) {
      console.error("Error updating campaigns:", error);
      setNotification({ action: "error", campaignNames: [] });
      setSnackbarOpen(true);
      setPendingAction(null);
    }
  };

  const handleTabChange = (status: TabStatus) => {
    setTab(status);
    setSelectedIds([]);
    setPageIndex(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIds([]);
    setPageIndex(0);
  };

  const handleOpenSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortMenuAnchorEl(null);
  };

  const handleSortChange = (value: SortKey) => {
    setSortBy(value);
    setPageIndex(0);
    handleCloseSortMenu();
  };

  const handleToggleSelection = (campaignId: number) => {
    setSelectedIds((current) =>
      current.includes(campaignId)
        ? current.filter((id) => id !== campaignId)
        : [...current, campaignId],
    );
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  const handlePreviousPage = () => {
    setPageIndex((current) => Math.max(current - 1, 0));
  };

  const handleNextPage = () => {
    setPageIndex((current) => Math.min(current + 1, totalPages - 1));
  };

  const handleOpenActionModal = (action: ReviewAction) => {
    if (!selectedIds.length) return;
    setPendingAction(action);
  };

  const handleCloseActionModal = () => {
    setPendingAction(null);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || selectedIds.length === 0) return;

    if (pendingAction === "APPROVE") {
      handleBulkUpdate(selectedIds, "approved");
    } else if (pendingAction === "DENY") {
      handleBulkUpdate(selectedIds, "denied");
    } else if (pendingAction === "REVERT") {
      handleBulkUpdate(selectedIds, "pending");
    }
  };

  const handleConfirmToggle = () => {
    onToggleApplication();
    setPendingToggle(false);
  };

  const hasSelectedRows = selectedIds.length > 0;
  const isDeniedTab = tab === "DENIED";
  const isActionModalOpen = pendingAction !== null;
  const isConfirming = updateCampaignMutation.isPending;
  const isSortMenuOpen = Boolean(sortMenuAnchorEl);
  const modalTitle =
    pendingAction === "APPROVE"
      ? "Confirm Approval"
      : pendingAction === "DENY"
        ? "Confirm Denial"
        : "Confirm Revert";
  const modalVerb =
    pendingAction === "APPROVE" ? "approve" : pendingAction === "DENY" ? "deny" : "revert";
  const currentActionLabel = isDeniedTab ? "RESTORE" : "DENY";

  const toggleModalTitle = isApplicationOpen
    ? "Close Application Submissions"
    : "Open Application Submissions";
  const toggleModalBody = isApplicationOpen
    ? "You are about to close application submissions. Are you sure you would like to proceed?"
    : "You are about to open up application submissions. Are you sure you would like to proceed?";

  const toggleSwitch = (
    <FormControlLabel
      control={
        <Switch
          checked={isApplicationOpen}
          onChange={() => setPendingToggle(true)}
          disabled={isTogglingApplication}
        />
      }
      label={
        <span className="text-[14px] text-[#4e5450]">Allow Application Submissions</span>
      }
    />
  );

  return (
    <div className="relative w-full max-w-[1200px] pb-24 pt-2">
      <BaseAlert
        open={isAlertOpen}
        onClose={() => {
          setSnackbarOpen(false);
          setNotification(null);
          clearActionSearchParams();
        }}
        title={
          activeNotification?.action === "approved"
            ? "Campaign Approved!"
            : activeNotification?.action === "denied"
              ? "Campaign Denied!"
              : activeNotification?.action === "reverted"
                ? "Campaign Restored!"
                : "Something went wrong."
        }
      >
        <div>
          {activeNotification?.action !== "error" && activeNotification?.campaignNames && (
            <>
              <p className="text-sm">
                {activeNotification.action === "approved"
                  ? "You have successfully approved:"
                  : activeNotification.action === "denied"
                    ? "You have successfully denied:"
                    : "You have successfully restored:"}
              </p>
              <ul className="my-1 list-disc pl-5 text-sm">
                {activeNotification.campaignNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              {activeNotification.action === "approved" && (
                <p className="text-sm">
                  You can view it on the &ldquo;Approved Campaigns&rdquo; page.
                </p>
              )}
            </>
          )}
          {notification?.action === "error" && (
            <p className="text-sm">An error occurred. Please try again.</p>
          )}
        </div>
      </BaseAlert>

      <Menu
        anchorEl={sortMenuAnchorEl}
        open={isSortMenuOpen}
        onClose={handleCloseSortMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          selected={sortBy === "submissionDate"}
          onClick={() => handleSortChange("submissionDate")}
        >
          <div className="flex min-w-[180px] items-center justify-between gap-4">
            <span>Submission Date</span>
            {sortBy === "submissionDate" && <CheckIcon className="!text-[#2D7A45]" />}
          </div>
        </MenuItem>
        <MenuItem
          selected={sortBy === "campaignTitle"}
          onClick={() => handleSortChange("campaignTitle")}
        >
          <div className="flex min-w-[180px] items-center justify-between gap-4">
            <span>Campaign Title</span>
            {sortBy === "campaignTitle" && <CheckIcon className="!text-[#2D7A45]" />}
          </div>
        </MenuItem>
        <MenuItem
          selected={sortBy === "campaignLeader"}
          onClick={() => handleSortChange("campaignLeader")}
        >
          <div className="flex min-w-[180px] items-center justify-between gap-4">
            <span>Campaign Leader</span>
            {sortBy === "campaignLeader" && <CheckIcon className="!text-[#2D7A45]" />}
          </div>
        </MenuItem>
      </Menu>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-3">
          <h2 className="text-[22px] font-bold text-[#214E34]">Review Applications</h2>
          <p className="mt-2 text-[14px] text-[#49514c]">
            <span className="font-semibold text-[#1f2320]">Campaign Application List</span>{" "}
            - {sortedApplications.length} Campaign{sortedApplications.length === 1 ? "" : "s"}
          </p>
          {hasSelectedRows && (
            <p className="mt-2 text-[13px] text-[#7b827d]">{selectedIds.length} Selected</p>
          )}
        </div>

        <div className="border-b border-[#d6e0d7]">
          <div className="flex items-end gap-7">
            {(["PENDING", "DENIED"] as TabStatus[]).map((status) => {
              const isActive = status === tab;
              const label = status === "PENDING" ? "Pending" : "Denied";

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleTabChange(status)}
                  className={clsx(
                    "relative flex items-center gap-1.5 pb-3 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors",
                    isActive ? "text-[#3D83F6]" : "text-[#5b615c]",
                  )}
                >
                  <span>{label}</span>
                  {status === "PENDING" && pendingCount > 0 && (
                    <span
                      className={clsx(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                        isActive ? "bg-[#3D83F6] text-white" : "bg-[#d9e7ff] text-[#3D83F6]",
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                  <span
                    className={clsx(
                      "absolute inset-x-0 bottom-0 h-[3px] rounded-full transition-opacity",
                      isActive ? "bg-[#3D83F6] opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="relative block flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 !h-5 !w-5 -translate-y-1/2 text-[#818881]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search"
              className="h-11 w-full rounded-[10px] border border-[#d9dfd9] bg-white pl-10 pr-4 text-[15px] text-[#475049] outline-none transition-colors placeholder:text-[#a9afa9] focus:border-[#8db097]"
            />
          </label>
          <button
            type="button"
            onClick={handleOpenSortMenu}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#d9dfd9] bg-white text-[#66706a] transition-colors hover:bg-[#f5f8f5]"
            aria-label="Sort applications"
          >
            <ImportExportIcon className="!h-5 !w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            disabled={!hasSelectedRows}
            onClick={() => handleOpenActionModal("APPROVE")}
            variant="contained"
            size="large"
            fullWidth
          >
            APPROVE
          </Button>
          <Button
            disabled={!hasSelectedRows}
            onClick={() => handleOpenActionModal(isDeniedTab ? "REVERT" : "DENY")}
            variant="outlined"
            size="large"
            fullWidth
          >
            {currentActionLabel}
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {sortedApplications.length === 0 ? (
            <div className="rounded-[18px] border border-[#dfe8df] bg-white px-5 py-8 text-center text-sm text-[#8a918b] shadow-[0_8px_20px_rgba(31,60,44,0.05)]">
              No applications found for this view.
            </div>
          ) : (
            visibleMobileApplications.map((application) => {
              const isSelected = selectedIds.includes(application.campaignId);

              return (
                <div
                  key={application.campaignId}
                  className={clsx(
                    "overflow-hidden rounded-[18px] border border-[#dfe8df] bg-white shadow-[0_8px_20px_rgba(31,60,44,0.05)]",
                    isSelected && "bg-[#edf3fb]",
                  )}
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelection(application.campaignId)}
                      className="mt-1 h-5 w-5 cursor-pointer rounded border-[#afb6b1] accent-[#6f7670]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-[#7b827d]">Campaign Title:</p>
                      <p className="mt-0.5 text-[16px] font-semibold leading-6 text-[#1f2320]">
                        {application.campaignTitle}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        router.push("/dashboard/review-applications/" + application.campaignId)
                      }
                      variant="outlined"
                      size="small"
                    >
                      VIEW
                    </Button>
                  </div>

                  <div className="border-t border-[#e6ece6] px-5 py-3">
                    <div className="flex items-center justify-between gap-3 border-b border-[#eef2ee] pb-3 text-[14px]">
                      <span className="text-[#7b827d]">Submission Date</span>
                      <span className="font-medium text-[#1f2320]">
                        {formatDate(application.submissionDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-3 text-[14px]">
                      <span className="text-[#7b827d]">Campaign Leader</span>
                      <span className="font-medium text-[#1f2320]">
                        {application.campaignLeader || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sortedApplications.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-3 text-[12px] text-[#7b827d]">
            <span>
              Showing {visibleMobileApplicationCount} of {sortedApplications.length}
            </span>
            {hasMoreMobileApplications && (
              <>
                <div ref={mobileApplicationsSentinelRef} className="h-1 w-full" />
                <Button variant="outlined" size="small" onClick={loadMoreMobileApplications}>
                  Load More
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="mb-5">

          <div className="mt-4 flex items-center justify-between border-b border-[#d6e0d7]">
            <div className="flex items-end gap-7">
              {(["PENDING", "DENIED"] as TabStatus[]).map((status) => {
                const isActive = status === tab;
                const label = status === "PENDING" ? "Pending" : "Denied";

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleTabChange(status)}
                    className={clsx(
                      "relative flex items-center gap-2 pb-3 text-[14px] font-semibold uppercase tracking-[0.04em] transition-colors",
                      isActive ? "text-[#3D83F6]" : "text-[#5b615c]",
                    )}
                  >
                    <span>{label}</span>
                    {status === "PENDING" && pendingCount > 0 && (
                      <span
                        className={clsx(
                          "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold",
                          isActive ? "bg-[#3D83F6] text-white" : "bg-[#d9e7ff] text-[#3D83F6]",
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "absolute inset-x-0 bottom-0 h-[3px] rounded-full transition-opacity",
                        isActive ? "bg-[#3D83F6] opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <div className="pb-2">{toggleSwitch}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#e4ebe4] bg-white shadow-[0_10px_24px_rgba(31,60,44,0.05)]">
          <div className="border-b border-[#eef2ee] px-5 pb-3 pt-4 sm:px-6">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-[16px] font-bold text-[#4e5450]">
                  Campaign Application List
                </h2>
                <p className="mt-0.5 text-sm text-[#9ca3af]">
                  {sortedApplications.length} Campaign{sortedApplications.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative block w-full max-w-[680px]">
                  <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#a0a6a0]">
                    Search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Start typing..."
                    className="h-14 w-full rounded-md border border-[#d9dfd9] px-4 text-[14px] text-[#475049] outline-none transition-colors placeholder:text-[#a9afa9] focus:border-[#8db097]"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <Button
                    disabled={!hasSelectedRows}
                    onClick={() => handleOpenActionModal("APPROVE")}
                    variant="contained"
                    size="small"
                  >
                    APPROVE
                  </Button>
                  {isDeniedTab ? (
                    <Button
                      disabled={!hasSelectedRows}
                      onClick={() => handleOpenActionModal("REVERT")}
                      variant="outlined"
                      size="small"
                    >
                      RESTORE
                    </Button>
                  ) : (
                    <Button
                      disabled={!hasSelectedRows}
                      onClick={() => handleOpenActionModal("DENY")}
                      variant="outlined"
                      size="small"
                    >
                      DENY
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#eef2ee] text-left text-[14px] font-semibold text-[#414644]">
                  <th className="w-8 px-3 py-3 sm:px-4" />
                  <th className="w-[190px] pl-0 pr-2 py-3">Submission Date</th>
                  <th className="w-[240px] pl-0 pr-2 py-3">Campaign Title</th>
                  <th className="w-[180px] px-2 py-3">Campaign Leader</th>
                  <th className="w-[180px] px-5 py-3 text-right sm:px-6" />
                </tr>
              </thead>

              <tbody>
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#8a918b]">
                      No applications found for this view.
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((application) => {
                    const isSelected = selectedIds.includes(application.campaignId);

                    return (
                      <tr
                        key={application.campaignId}
                        className={clsx(
                          "border-b border-[#eef2ee] text-[14px] text-[#59605b]",
                          isSelected && "bg-[#edf3fb]",
                        )}
                      >
                        <td className="px-3 py-3 sm:px-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelection(application.campaignId)}
                              className="h-4 w-4 cursor-pointer rounded border-[#afb6b1] accent-[#6f7670]"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-3 text-[#49514c]">
                          {formatDate(application.submissionDate)}
                        </td>
                        <td className="px-2 py-3 text-[#49514c]">{application.campaignTitle}</td>
                        <td className="px-2 py-3 text-[#49514c]">
                          {application.campaignLeader || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right sm:px-6">
                          <Button
                            onClick={() =>
                              router.push(
                                "/dashboard/review-applications/" + application.campaignId,
                              )
                            }
                            variant="outlined"
                            size="small"
                          >
                            VIEW APPLICATION
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 px-5 py-2.5 text-[12px] text-[#7b827d] sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span>Rows per page:</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                  className="appearance-none bg-transparent pr-5 font-medium text-[#6c736d] outline-none"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ArrowDropDownIcon className="pointer-events-none absolute right-0 top-1/2 !h-5 !w-5 -translate-y-1/2 text-[#8f9790]" />
              </div>
            </div>

            <span className="min-w-[72px] self-end text-right sm:self-center">
              {firstRow}-{lastRow} of {sortedApplications.length}
            </span>

            <div className="flex items-center justify-end gap-1 self-end sm:self-center">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPageIndex === 0}
                className="rounded-full p-1 text-[#8d948e] transition-colors hover:bg-[#f0f4f0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPageIndex >= totalPages - 1 || sortedApplications.length === 0}
                className="rounded-full p-1 text-[#8d948e] transition-colors hover:bg-[#f0f4f0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {isActionModalOpen && (
        <BaseModal open={isActionModalOpen} onClose={handleCloseActionModal} title={modalTitle}>
          <div className="px-4 pb-4 text-[16px] text-[#727873]">
            <p>
              {pendingAction === "REVERT"
                ? "You are about to move these campaigns back to the pending list:"
                : `You are about to bulk ${modalVerb} these campaigns:`}
            </p>
            <ul className="mt-2 list-disc pl-6 text-[#222622]">
              {selectedApplications.map((application) => (
                <li key={application.campaignId}>{application.campaignTitle}</li>
              ))}
            </ul>
            <p className="mt-3">
              {pendingAction === "REVERT"
                ? "Are you sure you would like to revert them? This will move them back to the pending list."
                : `Are you sure you would like to ${modalVerb}? This action cannot be undone.`}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 pb-4">
            <Button onClick={handleCloseActionModal} disabled={isConfirming} variant="text">
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isConfirming}
              variant="contained"
              size="small"
            >
              {isConfirming ? "..." : pendingAction}
            </Button>
          </div>
        </BaseModal>
      )}

      {/* Toggle Application Modal */}
      <BaseModal
        open={pendingToggle}
        onClose={() => setPendingToggle(false)}
        title={toggleModalTitle}
      >
        <div className="px-4 pb-4 text-[16px] text-[#727873]">
          <p>{toggleModalBody}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-4 pb-4">
          <Button onClick={() => setPendingToggle(false)} variant="text">
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmToggle}
            disabled={isTogglingApplication}
            variant="contained"
            size="small"
          >
            PROCEED
          </Button>
        </div>
      </BaseModal>
    </div>
  );
}
