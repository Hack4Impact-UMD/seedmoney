"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@mui/material";
import BaseAlert from "@/src/components/bases/BaseAlert";
import BaseModal from "@/src/components/bases/BaseModal";
import useUpdateCampaign from "@/src/hooks/campaigns/useUpdateCampaign";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadCampaignsNotApproved from "@/src/hooks/campaigns/useReadCampaignsNotApproved";
import type { Status } from "@/src/types/db/enums";


type ReviewApplicationsTableProps = {
  competitionId?: number;
};

const pageSizeOptions = [5, 10, 20];

type TabStatus = "PENDING" | "DENIED";
type ReviewAction = "APPROVE" | "DENY" | "REVERT";

const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${month}/${day}/${year}`;
};

export default function ReviewApplicationsTable({
  competitionId: propCompetitionId,
}: ReviewApplicationsTableProps) {
  const [tab, setTab] = useState<TabStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [notification, setNotification] = useState<{
    action: "approved" | "denied" | "reverted" | "error";
    campaignNames: string[];
  } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: competition } = useReadCurrentCompetition();
  const competitionId = propCompetitionId ?? competition?.competition_id ?? 0;
  const {
    data: applications = [],
  } = useReadCampaignsNotApproved(competitionId);
  const updateCampaignMutation = useUpdateCampaign(competitionId);

  useEffect(() => {
    if (!notification) return;
    setSnackbarOpen(true);
    const timer = setTimeout(() => {
      setSnackbarOpen(false);
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const pendingCount = useMemo(
    () =>
      applications.filter((a) => a.status === "submitted_under_review").length,
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const dbStatus =
      tab === "PENDING" ? "submitted_under_review" : "not_approved";
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize),
  );
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);
  const paginatedApplications = useMemo(() => {
    const start = currentPageIndex * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [currentPageIndex, filteredApplications, pageSize]);
  const firstRow =
    filteredApplications.length === 0 ? 0 : currentPageIndex * pageSize + 1;
  const lastRow = Math.min(
    (currentPageIndex + 1) * pageSize,
    filteredApplications.length,
  );
  const selectedApplications = applications.filter((application) =>
    selectedIds.includes(application.campaignId),
  );

  const handleBulkUpdate = async (
    ids: number[],
    status: Status,
  ) => {
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

      const action =
        status === "approved"
          ? "approved"
          : status === "not_approved"
            ? "denied"
            : "reverted";
      setNotification({ action, campaignNames: names });
      setSelectedIds([]);
      setPendingAction(null);

      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ["campaigns-under-review", competitionId],
      });
    } catch (error) {
      console.error("Error updating campaigns:", error);
      setNotification({ action: "error", campaignNames: [] });
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
      handleBulkUpdate(selectedIds, "not_approved");
    } else if (pendingAction === "REVERT") {
      handleBulkUpdate(selectedIds, "submitted_under_review");
    }
  };

  const hasSelectedRows = selectedIds.length > 0;
  const isDeniedTab = tab === "DENIED";
  const isActionModalOpen = pendingAction !== null;
  const isConfirming = updateCampaignMutation.isPending;
  const modalTitle =
    pendingAction === "APPROVE"
      ? "Confirm Approval"
      : pendingAction === "DENY"
        ? "Confirm Denial"
        : "Confirm Revert";
  const modalVerb =
    pendingAction === "APPROVE"
      ? "approve"
      : pendingAction === "DENY"
        ? "deny"
        : "revert";

  return (
    <div className="relative w-full max-w-[1200px] pb-24 pt-2">
      <BaseAlert
        open={snackbarOpen}
        onClose={() => {
          setSnackbarOpen(false);
          setNotification(null);
        }}
        title={
          notification?.action === "approved"
            ? "Campaign Approved!"
            : notification?.action === "denied"
              ? "Campaign Denied!"
              : notification?.action === "reverted"
                ? "Campaign Restored!"
                : "Something went wrong."
        }
      >
        <div>
          {notification?.action !== "error" && notification?.campaignNames && (
            <>
              <p className="text-sm">
                {notification.action === "approved"
                  ? "You have successfully approved:"
                  : notification.action === "denied"
                    ? "You have successfully denied:"
                    : "You have successfully restored:"}
              </p>
              <ul className="my-1 list-disc pl-5 text-sm">
                {notification.campaignNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              {notification.action === "approved" && (
                <p className="text-sm">
                  You can view it on the &ldquo;Ongoing Campaigns&rdquo; page.
                </p>
              )}
            </>
          )}
          {notification?.action === "error" && (
            <p className="text-sm">An error occurred. Please try again.</p>
          )}
        </div>
      </BaseAlert>

      <div className="mb-5 pt-8">
        <h1 className="text-[40px] font-semibold tracking-[-0.04em] text-[#214E34] sm:text-[42px]">
          Review Campaigns
        </h1>

        <div className="mt-4 flex items-end gap-7 border-b border-[#d6e0d7]">
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
                {status === "PENDING" && (
                  <span
                    className={clsx(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold",
                      isActive
                        ? "bg-[#3D83F6] text-white"
                        : "bg-[#d9e7ff] text-[#3D83F6]",
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

      <div className="overflow-hidden rounded-[18px] border border-[#e4ebe4] bg-white shadow-[0_10px_24px_rgba(31,60,44,0.05)]">
        <div className="border-b border-[#eef2ee] px-5 pb-3 pt-4 sm:px-6">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-[16px] font-medium text-[#4e5450]">
                Campaign Application List
              </h2>
              <p className="mt-0.5 text-sm text-[#9ca3af]">
                {filteredApplications.length} Application
                {filteredApplications.length === 1 ? "" : "s"}
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
                  className="h-10 w-full rounded-md border border-[#d9dfd9] px-4 text-[14px] text-[#475049] outline-none transition-colors placeholder:text-[#a9afa9] focus:border-[#8db097]"
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
                {/*<th className="w-[100px] px-2 py-3">Raised</th>*/}
                {/*<th className="w-[100px] px-2 py-3">Goal</th>*/}
                {/*<th className="w-[180px] px-2 py-3">Goal Progress</th>*/}
                <th className="w-[180px] px-5 py-3 text-right sm:px-6" />
              </tr>
            </thead>

            <tbody>
              {paginatedApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-[#8a918b]"
                  >
                    No applications found for this view.
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((application) => {
                  const isSelected = selectedIds.includes(
                    application.campaignId,
                  );
                  const progressCapped = Math.min(application.goalProgress, 100);

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
                            onChange={() =>
                              handleToggleSelection(application.campaignId)
                            }
                            className="h-4 w-4 cursor-pointer rounded border-[#afb6b1] accent-[#6f7670]"
                          />
                        </div>
                      </td>
                        <td className="px-2 py-3 text-[#49514c]">
                          {formatDate(application.submissionDate)}
                        </td>
                      <td className="px-2 py-3 text-[#49514c]">
                        {application.campaignTitle}
                      </td>
                      <td className="px-2 py-3 text-[#49514c]">
                        {application.campaignLeader || "—"}
                      </td>
                      {/*<td className="px-2 py-3">*/}
                      {/*  {formatCurrency(application.raised)}*/}
                      {/*</td>*/}
                      {/*<td className="px-2 py-3">*/}
                      {/*  {formatCurrency(application.goal)}*/}
                      {/*</td>*/}
                      {/*<td className="px-2 py-3">*/}
                      {/*  <div className="flex items-center gap-2">*/}
                      {/*    <div className="w-full max-w-[100px] rounded-full bg-blue-100 h-2">*/}
                      {/*      <div*/}
                      {/*        className="bg-blue-600 h-2 rounded-full"*/}
                      {/*        style={{ width: `${progressCapped}%` }}*/}
                      {/*      />*/}
                      {/*    </div>*/}
                      {/*    <span className="whitespace-nowrap text-sm text-[#59605b]">*/}
                      {/*      {application.goalProgress}%*/}
                      {/*    </span>*/}
                      {/*  </div>*/}
                      {/*</td>*/}
                      <td className="px-4 py-2.5 text-right sm:px-6">
                        <Button
                          onClick={() =>
                            router.push(
                              "/dashboard/review-applications/" +
                                application.campaignId,
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
                onChange={(event) =>
                  handlePageSizeChange(Number(event.target.value))
                }
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
            {firstRow}-{lastRow} of {filteredApplications.length}
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
              disabled={
                currentPageIndex >= totalPages - 1 ||
                filteredApplications.length === 0
              }
              className="rounded-full p-1 text-[#8d948e] transition-colors hover:bg-[#f0f4f0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {isActionModalOpen && (
        <BaseModal
          open={isActionModalOpen}
          onClose={handleCloseActionModal}
          title={modalTitle}
        >
          <div className="px-4 pb-4 text-[14px] text-[#727873]">
            <p>
              {pendingAction === "REVERT"
                ? "You are about to move these campaigns back to the pending list:"
                : `You are about to bulk ${modalVerb} these campaigns:`}
            </p>
            <ul className="mt-2 list-disc pl-6 text-[#222622]">
              {selectedApplications.map((application) => (
                <li key={application.campaignId}>
                  {application.campaignTitle}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              {pendingAction === "REVERT"
                ? "Are you sure you would like to revert them? This will move them back to the pending list."
                : `Are you sure you would like to ${modalVerb}? This action cannot be undone.`}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 pb-4">
            <Button
              onClick={handleCloseActionModal}
              disabled={isConfirming}
              variant="text"
            >
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
    </div>
  );
}
