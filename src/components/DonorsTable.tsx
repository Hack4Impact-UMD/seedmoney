"use client";

import React, { useCallback, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import useReadTransactionsByCampaign from "@/src/hooks/transactions/useReadTransactionsByCampaign";
import { Donor } from "@/src/types/frontend/donorsTable";

interface DonorsTableProps {
  campaignId: number;
}

export default function DonorsTable({ campaignId }: DonorsTableProps) {
  const { data: transactions, isLoading } = useReadTransactionsByCampaign(campaignId);
  const [searchQuery, setSearchQuery] = useState("");

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

  const sanitizeCsvValue = useCallback((value: unknown) => {
    const stringValue = String(value);

    if (/^[=+\-@]/.test(stringValue)) {
      return `'${stringValue}`;
    }

    return stringValue;
  }, []);

  const handleExportCsv = useCallback(() => {
    if (filteredData.length === 0) {
      return;
    }

    const rows = [
      ["ID", "Amount", "Contributor", "Contributor Email", "Date", "Status"],
      ...filteredData.map((donor) => [
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
    link.setAttribute("download", `campaign-${campaignId}-donors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [campaignId, filteredData, sanitizeCsvValue]);

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
      cell: (info) => info.getValue(),
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
    data: filteredData,
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

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading donors...</div>;
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl bg-white md:mx-auto md:w-full border border-1 border-[#e5e5e5]">
        <div className="px-5 pt-8">
          <h2 className="text-center text-black sm:text-left">Donors List</h2>
          <p className="text-center text-sm text-gray-500 sm:text-left">
            {filteredData.length} donor{filteredData.length === 1 ? "" : "s"}
          </p>

          <div className="relative my-6">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
              Search
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2.5 transition-colors focus-within:border-blue-500">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by donor, email, ID, reward, or amount"
                className="w-full overflow-x-auto bg-transparent p-1 text-md outline-none"
              />
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No donors available.</div>
        ) : (
          <>
            <table className="w-full">
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

            <div className="flex items-center justify-end gap-6 border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
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
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredData.length,
                )}{" "}
                of {filteredData.length}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="text"
                  size="small"
                  className="!min-w-0 !p-1 !text-2xl !font-bold !text-black disabled:!opacity-30"
                >
                  &lt;
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="text"
                  size="small"
                  className="!min-w-0 !p-1 !text-2xl !font-bold !text-black disabled:!opacity-30"
                >
                  &gt;
                </Button>
              </div>
            </div>
          </>
        )}
        <Button
          variant="contained"
          size="small"
          onClick={handleExportCsv}
          disabled={filteredData.length === 0}
          className="!mb-7 !ml-4"
        >
          Export to CSV
        </Button>
      </div>
    </div>
  );
}
