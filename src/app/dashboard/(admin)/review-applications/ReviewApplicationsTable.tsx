"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useRouter } from "next/navigation";
import { updateCampaign } from "@/src/actions/db/campaigns";
import type { Status } from "@/src/types/db/enums";

export type ReviewApplicationRow = {
  campaignId: number;
  campaignTitle: string;
  campaignLeader: string;
  raised: number;
  goal: number;
  goalProgress: number;
  status: "submitted_under_review" | "not_approved";
};

type ReviewApplicationsTableProps = {
  applications: ReviewApplicationRow[];
  isLoading?: boolean;
  onRefetch: () => void;
};

const pageSizeOptions = [5, 10, 20];

type TabStatus = "PENDING" | "DENIED";
type ReviewAction = "APPROVE" | "DENY" | "REVERT";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ReviewApplicationsTable({
  applications,
  isLoading = false,
  onRefetch,
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
  const router = useRouter();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: number[];
      status: Status;
    }) => {
      await Promise.all(ids.map((id) => updateCampaign(id, { status })));
    },
    onSuccess: (_, { status }) => {
      const names = selectedApplications.map((a) => a.campaignTitle);
      const action =
        status === "approved"
          ? "approved"
          : status === "not_approved"
            ? "denied"
            : "reverted";
      setNotification({ action, campaignNames: names });
      setSelectedIds([]);
      setPendingAction(null);
      onRefetch();
    },
    onError: () => {
      setNotification({ action: "error", campaignNames: [] });
      setPendingAction(null);
    },
  });

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

  const handleConfirmAction = () => {
    if (!pendingAction || selectedIds.length === 0) return;

    if (pendingAction === "APPROVE") {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: "approved" });
    } else if (pendingAction === "DENY") {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: "not_approved" });
    } else if (pendingAction === "REVERT") {
      bulkUpdateMutation.mutate({
        ids: selectedIds,
        status: "submitted_under_review",
      });
    }
  };

  const hasSelectedRows = selectedIds.length > 0;
  const isDeniedTab = tab === "DENIED";
  const isActionModalOpen = pendingAction !== null;
  const isConfirming = bulkUpdateMutation.isPending;
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
      {notification && (
        <div
          className={clsx(
            "fixed right-6 top-6 z-50 w-[320px] rounded-lg px-5 py-4 shadow-lg",
            notification.action === "error"
              ? "border border-red-200 bg-red-50"
              : "border border-[#b8d9c0] bg-[#eef7f0]",
          )}
        >
          <div className="flex items-start gap-3">
            {notification.action !== "error" && (
              <CheckCircleOutlineIcon
                className="mt-0.5 shrink-0 text-[#2D7A45]"
                sx={{ fontSize: 22 }}
              />
            )}
            <div className="flex-1 text-[14px] text-[#214E34]">
              <p className="mb-1 font-bold">
                {notification.action === "approved"
                  ? "Campaign Approved!"
                  : notification.action === "denied"
                    ? "Campaign Denied!"
                    : notification.action === "reverted"
                      ? "Campaign Restored!"
                      : "Something went wrong."}
              </p>
              {notification.action !== "error" && (
                <>
                  <p>
                    {notification.action === "approved"
                      ? "You have successfully approved:"
                      : notification.action === "denied"
                        ? "You have successfully denied:"
                        : "You have successfully restored:"}
                  </p>
                  <ul className="my-1 list-disc pl-5">
                    {notification.campaignNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                  {notification.action === "approved" && (
                    <p>
                      You can view it on the &ldquo;Ongoing Campaigns&rdquo; page.
                    </p>
                  )}
                </>
              )}
              {notification.action === "error" && (
                <p className="text-red-700">An error occurred. Please try again.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="shrink-0 rounded p-0.5 text-[#4e7a5a] hover:bg-[#d6edd9]"
              aria-label="Dismiss notification"
            >
              <CloseOutlinedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}

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
                {isDeniedTab ? (
                  <button
                    type="button"
                    disabled={!hasSelectedRows}
                    onClick={() => handleOpenActionModal("REVERT")}
                    className="rounded-[8px] border border-[#2D7A45] bg-white px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-[#2D7A45] transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    RESTORE
                  </button>
                ) : (
                    <button
                      type="button"
                      disabled={!hasSelectedRows}
                      onClick={() => handleOpenActionModal("DENY")}
                      className="rounded-[8px] border border-[#2D7A45] bg-white px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-[#2D7A45] transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      DENY
                    </button>
                )}
                  <button
                      type="button"
                      disabled={!hasSelectedRows}
                      onClick={() => handleOpenActionModal("APPROVE")}
                      className="rounded-[8px] bg-[#2D7A45] px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  >
                      APPROVE
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#eef2ee] text-left text-[14px] font-semibold text-[#414644]">
                <th className="w-8 px-3 py-3 sm:px-4" />
                <th className="w-[240px] pl-0 pr-2 py-3">Campaign Title</th>
                <th className="w-[180px] px-2 py-3">Campaign Leader</th>
                <th className="w-[100px] px-2 py-3">Raised</th>
                <th className="w-[100px] px-2 py-3">Goal</th>
                <th className="w-[180px] px-2 py-3">Goal Progress</th>
                <th className="w-[180px] px-5 py-3 text-right sm:px-6" />
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-[#8a918b]"
                  >
                    Loading applications...
                  </td>
                </tr>
              ) : paginatedApplications.length === 0 ? (
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
                        {application.campaignTitle}
                      </td>
                      <td className="px-2 py-3 text-[#49514c]">
                        {application.campaignLeader || "—"}
                      </td>
                      <td className="px-2 py-3">
                        {formatCurrency(application.raised)}
                      </td>
                      <td className="px-2 py-3">
                        {formatCurrency(application.goal)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[100px] rounded-full bg-blue-100 h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progressCapped}%` }}
                            />
                          </div>
                          <span className="whitespace-nowrap text-sm text-[#59605b]">
                            {application.goalProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/dashboard/review-applications/" +
                                application.campaignId,
                            )
                          }
                          className="rounded-[10px] border border-[#2D7A45] px-4 py-1.5 text-[13px] font-semibold text-[#2D7A45] transition-colors hover:bg-[#f5faf5]"
                        >
                          VIEW APPLICATION
                        </button>
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
        <div className="fixed inset-0 z-40 bg-[rgba(31,41,35,0.24)]">
          <div className="ml-[240px] flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-[480px] rounded bg-white shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between px-4 pb-2 pt-4">
                <h3 className="text-[18px] font-semibold text-[#214E34]">
                  {modalTitle}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  disabled={isConfirming}
                  className="rounded p-1 text-[#7d8480] transition-colors hover:bg-[#f2f4f2]"
                  aria-label="Close dialog"
                >
                  <CloseOutlinedIcon />
                </button>
              </div>

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
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  disabled={isConfirming}
                  className="px-3 py-2 text-[14px] font-medium text-[#6e7570]"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isConfirming}
                  className="rounded-[8px] bg-[#2D7A45] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                >
                  {isConfirming ? "..." : pendingAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
