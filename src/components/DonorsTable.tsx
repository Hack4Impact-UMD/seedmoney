"use client";

import React, { useCallback, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import useReadTransactionsByCampaign from "@/src/hooks/transactions/useReadTransactionsByCampaign";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import { Donor } from "@/src/types/frontend/donorsTable";

interface DonorsTableProps {
  campaignId: number;
  campaignName?: string;
}

type DonorSort = "date" | "id" | "amount_asc" | "amount_desc" | "name" | "email";

const mobilePageSize = 3;
const sortOptions: { label: string; value: DonorSort }[] = [
  { label: "ID", value: "id" },
  { label: "Amount Low to High", value: "amount_asc" },
  { label: "Amount High to Low", value: "amount_desc" },
  { label: "Contributor Name", value: "name" },
  { label: "Contributor Email", value: "email" },
];

export default function DonorsTable({
  campaignId,
  campaignName,
}: DonorsTableProps) {
  const { data: transactions, isLoading } = useReadTransactionsByCampaign(campaignId);
  const { data: campaignsData } = useReadCampaign(
    campaignName ? undefined : { campaignId },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<DonorSort>("date");
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [mobilePageIndex, setMobilePageIndex] = useState(0);

  const donors: Donor[] = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((t) => ({
      id: t.transaction_id,
      name: `${t.first_name} ${t.last_name}`,
      email: t.email,
      amount: t.amount_donated,
      date: t.date,
      status: t.status,
    }));
  }, [transactions]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return donors;

    return donors.filter((donor) => {
      const numericQuery = Number(query);

      if (!Number.isNaN(numericQuery) && donor.amount === numericQuery) {
        return true;
      }

      return (
        String(donor.id).includes(query) ||
        donor.name.toLowerCase().includes(query) ||
        donor.email.toLowerCase().includes(query) ||
        donor.status.toLowerCase().includes(query)
      );
    });
  }, [donors, searchQuery]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    sorted.sort((first, second) => {
      switch (sortBy) {
        case "amount_asc":
          return first.amount - second.amount;
        case "amount_desc":
          return second.amount - first.amount;
        case "name":
          return first.name.localeCompare(second.name, undefined, {
            sensitivity: "base",
          });
        case "email":
          return first.email.localeCompare(second.email, undefined, {
            sensitivity: "base",
          });
        case "id":
          return first.id - second.id;
        case "date":
          return first.date.localeCompare(second.date);
      }
    });

    return sorted;
  }, [filteredData, sortBy]);

  const sanitizeCsvValue = useCallback((value: unknown) => {
    const stringValue = String(value);

    if (/^[=+\-@]/.test(stringValue)) {
      return `'${stringValue}`;
    }

    return stringValue;
  }, []);

  const exportFileName = useMemo(() => {
    const resolvedCampaignName =
      campaignName || campaignsData?.[0]?.name || `campaign-${campaignId}`;

    const normalizedCampaignName = resolvedCampaignName
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "-");

    return `${normalizedCampaignName || `campaign-${campaignId}`}-donors.csv`;
  }, [campaignId, campaignName, campaignsData]);

  const handleExportCsv = useCallback(() => {
    if (sortedData.length === 0) {
      return;
    }

    const rows = [
      ["ID", "Amount", "Contributor", "Contributor Email", "Date", "Status"],
      ...sortedData.map((donor) => [
        sanitizeCsvValue(donor.id),
        sanitizeCsvValue(donor.amount.toFixed(2)),
        sanitizeCsvValue(donor.name),
        sanitizeCsvValue(donor.email),
        sanitizeCsvValue(donor.date.split("T")[0]),
        sanitizeCsvValue(donor.status),
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${sanitizeCsvValue(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [exportFileName, sanitizeCsvValue, sortedData]);

  const handleCopyEmail = useCallback(async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
  }, []);

  const columnHelper = createColumnHelper<Donor>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="font-medium text-gray-700">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("name", {
      header: "Contributor",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Contributor Email",
      cell: (info) => {
        const email = info.getValue();

        return (
          <div className="group/email inline-flex max-w-full items-center gap-2">
            <a href={`mailto:${email}`} className="truncate underline">
              {email}
            </a>
            <button
              type="button"
              title="Copy email"
              aria-label={`Copy ${email}`}
              onClick={() => void handleCopyEmail(email)}
              className="shrink-0 text-gray-500 opacity-0 transition-opacity group-hover/email:opacity-100 group-focus-within/email:opacity-100"
            >
              <ContentCopyOutlinedIcon className="text-[16px]!" />
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => info.getValue().split("T")[0],
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const isSuccess = status.toLowerCase() === "succeeded" || status.toLowerCase() === "paid";

        return (
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
              isSuccess
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700",
            ].join(" ")}
          >
            {isSuccess ? "Success" : status}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: sortedData,
    columns,
    state: {
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: useCallback(() => true, []),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const firstRow = sortedData.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, sortedData.length);
  const mobilePageCount = Math.max(1, Math.ceil(sortedData.length / mobilePageSize));
  const currentMobilePageIndex = Math.min(mobilePageIndex, mobilePageCount - 1);
  const mobileFirstRow = currentMobilePageIndex * mobilePageSize + 1;
  const visibleMobileDonors = sortedData.slice(
    currentMobilePageIndex * mobilePageSize,
    currentMobilePageIndex * mobilePageSize + mobilePageSize,
  );

  const handleSortChange = (value: DonorSort) => {
    setSortBy(value);
    setMobilePageIndex(0);
    table.setPageIndex(0);
    setSortAnchorEl(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading donors...</div>;
  }

  return (
    <div className="w-full">
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className:
              "mt-2 min-w-[260px] overflow-hidden rounded-md border border-[#e5e5e5] bg-white shadow-lg",
          },
        }}
      >
        <div className="border-b border-[#e5e5e5] px-5 py-4 text-base font-semibold text-[#212121]">
          Sort By
        </div>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className="px-5! py-3!"
          >
            <div className="flex w-full min-w-[220px] items-center justify-between gap-4 text-base">
              <span>{option.label}</span>
              {sortBy === option.value && (
                <CheckIcon className="text-[#2D7A45]!" />
              )}
            </div>
          </MenuItem>
        ))}
      </Menu>

      <div className="w-full min-w-0 overflow-x-auto rounded-xl bg-white border border-1 border-[#e5e5e5] md:mx-auto">
        <div className="px-5 pt-6">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h2 className="text-black">Donation List</h2>
              <p className="text-sm text-gray-500">
                {filteredData.length} Donation{filteredData.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={sortedData.length === 0}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold uppercase text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export to CSV
            </button>
          </div>

          <div className="flex items-center gap-2 my-4">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 transition-colors focus-within:border-blue-500">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-gray-400">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#9CA3AF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMobilePageIndex(0);
                  table.setPageIndex(0);
                }}
                placeholder="Search"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={(event) => setSortAnchorEl(event.currentTarget)}
              aria-label="Sort donations"
              aria-haspopup="menu"
              aria-expanded={Boolean(sortAnchorEl)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500"
            >
              <ImportExportIcon className="h-5! w-5!" />
            </button>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No donors available.</div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3 px-4 pb-6 pt-2 text-sm text-[#666666] md:hidden">
              <span>Viewing Page</span>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() =>
                  setMobilePageIndex(Math.max(currentMobilePageIndex - 1, 0))
                }
                disabled={currentMobilePageIndex === 0}
                className="text-[#667085] disabled:opacity-30"
              >
                <KeyboardArrowLeftIcon />
              </button>
              <span className="flex h-11 min-w-[68px] items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[#212121]">
                {currentMobilePageIndex + 1}
              </span>
              <button
                type="button"
                aria-label="Next page"
                onClick={() =>
                  setMobilePageIndex(
                    Math.min(currentMobilePageIndex + 1, mobilePageCount - 1),
                  )
                }
                disabled={currentMobilePageIndex >= mobilePageCount - 1}
                className="text-[#667085] disabled:opacity-30"
              >
                <KeyboardArrowRightIcon />
              </button>
              <span>of {mobilePageCount}</span>
            </div>

            {/* Mobile card view */}
            <div className="flex w-full flex-col gap-3 px-4 pb-4 md:hidden">
              {visibleMobileDonors.map((donor, index) => {
                const isSuccess = donor.status.toLowerCase() === "succeeded" || donor.status.toLowerCase() === "paid";
                return (
                  <div key={donor.id} className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-800">{String(mobileFirstRow + index).padStart(2, "0")}</span>
                    </div>
                    {[
                      { label: "Contributor Name", value: donor.name },
                      { label: "Amount", value: `$${donor.amount.toFixed(2)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-xs text-gray-400">{label}</span>
                        <span className="text-sm text-gray-800 text-right max-w-[55%] truncate">{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                      <span className="shrink-0 text-xs text-gray-400">
                        Contributor Email
                      </span>
                      <div className="flex min-w-0 max-w-[62%] items-center gap-2">
                        <a
                          href={`mailto:${donor.email}`}
                          className="truncate text-sm text-gray-800 underline"
                        >
                          {donor.email}
                        </a>
                        <button
                          type="button"
                          title="Copy email"
                          aria-label={`Copy ${donor.email}`}
                          onClick={() => void handleCopyEmail(donor.email)}
                          className="shrink-0 text-gray-500"
                        >
                          <ContentCopyOutlinedIcon className="text-[16px]!" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${isSuccess ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {isSuccess ? "Success" : donor.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table view */}
            <table className="hidden md:table w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border-b border-gray-300 px-5 py-4 text-left"
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
                  <tr key={row.id}>
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

            <div className="hidden items-center justify-end gap-6 border-t border-gray-100 px-6 py-4 text-sm text-gray-500 md:flex">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  aria-label="Rows per page"
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
                <Button
                  aria-label="Previous page"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="text"
                  size="small"
                  className="min-w-0! p-1! text-2xl! font-bold! text-black! disabled:opacity-30!"
                >
                  &lt;
                </Button>
                <Button
                  aria-label="Next page"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="text"
                  size="small"
                  className="min-w-0! p-1! text-2xl! font-bold! text-black! disabled:opacity-30!"
                >
                  &gt;
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
