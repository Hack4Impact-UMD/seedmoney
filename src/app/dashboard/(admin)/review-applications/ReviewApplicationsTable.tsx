"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import type {
  ReviewApplication,
  ReviewApplicationStatus,
} from "@/src/app/dashboard/(admin)/review-applications/mockReviewApplications";
import {useRouter} from "next/navigation";

type ReviewApplicationsTableProps = {
  applications: ReviewApplication[];
};

const pageSizeOptions = [5, 10, 20];

type ReviewAction = "APPROVE" | "DENY";

type ToastState = {
  action: ReviewAction;
  count: number;
} | null;

const formatSubmissionDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function ReviewApplicationsTable({
  applications,
}: ReviewApplicationsTableProps) {
  const [applicationRows, setApplicationRows] =
    useState<ReviewApplication[]>(applications);
  const [tab, setTab] = useState<ReviewApplicationStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const router = useRouter();

  const countsByStatus = useMemo(
    () =>
      applicationRows.reduce(
        (counts, application) => {
          if (application.status === "PENDING" || application.status === "DENIED") {
            counts[application.status] += 1;
          }
          return counts;
        },
        { PENDING: 0, DENIED: 0 } as Record<"PENDING" | "DENIED", number>,
      ),
    [applicationRows],
  );

  const filteredApplications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return applicationRows.filter((application) => {
      if (application.status !== tab) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        application.campaignTitle.toLowerCase().includes(normalizedQuery) ||
        application.campaignLeader.toLowerCase().includes(normalizedQuery) ||
        formatSubmissionDate(application.submissionDate)
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [applicationRows, searchQuery, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
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
  const selectedApplications = applicationRows.filter((application) =>
    selectedIds.includes(application.campaignId),
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleTabChange = (status: ReviewApplicationStatus) => {
    setTab(status);
    setSelectedIds([]);
    setPageIndex(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
    if (!selectedIds.length) {
      return;
    }

    setPendingAction(action);
  };

  const handleCloseActionModal = () => {
    setPendingAction(null);
  };

  const handleConfirmAction = () => {
    if (!pendingAction || selectedIds.length === 0) {
      return;
    }

    const nextStatus: ReviewApplicationStatus =
      pendingAction === "APPROVE" ? "APPROVED" : "DENIED";

    setApplicationRows((current) =>
      current.map((application) =>
        selectedIds.includes(application.campaignId)
          ? { ...application, status: nextStatus }
          : application,
      ),
    );
    setToast({ action: pendingAction, count: selectedIds.length });
    setSelectedIds([]);
    setPendingAction(null);
    setPageIndex(0);
  };

  const hasSelectedRows = selectedIds.length > 0;
  const isActionModalOpen = pendingAction !== null;
  const modalTitle =
    pendingAction === "APPROVE" ? "Confirm Approval" : "Confirm Denial";
  const modalVerb = pendingAction === "APPROVE" ? "approve" : "deny";

  return (
    <div className="relative w-full max-w-[1040px] pb-24 pt-2">
      {toast && (
        <div className="fixed right-8 top-8 z-30 flex justify-end">
          <div className="flex min-w-[300px] max-w-[340px] items-start gap-3 rounded-sm bg-[#f4fbf2] px-4 py-3 text-[#3b5a40] shadow-[0_8px_24px_rgba(74,107,79,0.08)]">
            <CheckCircleOutlinedIcon className="mt-0.5 !h-5 !w-5 text-[#5f9e68]" />
            <div>
              <p className="text-[14px] font-semibold">
                {toast.action === "APPROVE"
                  ? "Campaigns Approved!"
                  : "Campaigns Denied!"}
              </p>
              <p className="mt-1 text-[13px] leading-5">
                {toast.action === "APPROVE"
                  ? `You have successfully approved ${toast.count} campaign${toast.count === 1 ? "" : "s"}.`
                  : `You have successfully denied ${toast.count} campaign${toast.count === 1 ? "" : "s"}.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 pt-14">
        <h1 className="text-[40px] font-semibold tracking-[-0.04em] text-[#214E34] sm:text-[42px]">
          Review Campaigns
        </h1>

        <div className="mt-4 flex items-end gap-7 border-b border-[#d6e0d7]">
          {(["PENDING", "DENIED"] as ReviewApplicationStatus[]).map((status) => {
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
                    {countsByStatus[status]}
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
                <button
                  type="button"
                  disabled={!hasSelectedRows}
                  onClick={() => handleOpenActionModal("APPROVE")}
                  className="rounded-[8px] bg-[#2D7A45] px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                >
                  APPROVE
                </button>
                <button
                  type="button"
                  disabled={!hasSelectedRows}
                  onClick={() => handleOpenActionModal("DENY")}
                  className="rounded-[8px] border border-[#2D7A45] bg-white px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-[#2D7A45] transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                >
                  DENY
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#eef2ee] text-left text-[14px] font-semibold text-[#414644]">
                <th className="w-8 px-3 py-3 sm:px-4" />
                <th className="w-[190px] pl-0 pr-2 py-3">Submission Date (MM/D...</th>
                <th className="w-[340px] px-2 py-3">Campaign Title</th>
                <th className="w-[210px] px-2 py-3">Campaign Leader</th>
                <th className="w-[210px] px-5 py-3 text-right sm:px-6" />
              </tr>
            </thead>

            <tbody>
              {paginatedApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-[#8a918b]"
                  >
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
                      <td className="px-2 py-3">
                        {formatSubmissionDate(application.submissionDate)}
                      </td>
                      <td className="px-2 py-3 text-[#49514c]">
                        {application.campaignTitle}
                      </td>
                      <td className="px-2 py-3 text-[#49514c]">
                        {application.campaignLeader}
                      </td>
                      <td className="px-5 py-2.5 text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() =>
                            router.push("/dashboard/review-applications/" + application.campaignId)
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
                  className="rounded p-1 text-[#7d8480] transition-colors hover:bg-[#f2f4f2]"
                  aria-label="Close dialog"
                >
                  <CloseOutlinedIcon />
                </button>
              </div>

              <div className="px-4 pb-4 text-[14px] text-[#727873]">
                <p>
                  You are about to bulk {modalVerb} these campaigns:
                </p>
                <ul className="mt-2 list-disc pl-6 text-[#222622]">
                  {selectedApplications.map((application) => (
                    <li key={application.campaignId}>{application.campaignTitle}</li>
                  ))}
                </ul>
                <p className="mt-3">
                  Are you sure you would like to {modalVerb}? This action cannot be
                  undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 px-4 pb-4">
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  className="px-3 py-2 text-[14px] font-medium text-[#6e7570]"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="rounded-[8px] bg-[#2D7A45] px-4 py-2 text-[13px] font-semibold text-white"
                >
                  {pendingAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
