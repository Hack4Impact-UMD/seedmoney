"use client";

import React, { useCallback, useMemo, useState } from "react";
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
        <div className="px-5 pt-6">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h2 className="text-black">Donation List</h2>
              <p className="text-sm text-gray-500">
                {filteredData.length} Donation{filteredData.length === 1 ? "" : "s"}
              </p>
            </div>
            <button className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold uppercase text-gray-700 hover:bg-gray-50 cursor-pointer">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke="#6B7280" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No donors available.</div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
              {table.getRowModel().rows.map((row, index) => {
                const donor = row.original;
                const isSuccess = donor.status.toLowerCase() === "succeeded" || donor.status.toLowerCase() === "paid";
                return (
                  <div key={row.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-800">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    {[
                      { label: "Contributor Name", value: donor.name },
                      { label: "Amount", value: `$${donor.amount.toFixed(2)}` },
                      { label: "Contributor Email", value: donor.email },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-xs text-gray-400">{label}</span>
                        <span className="text-sm text-gray-800 text-right max-w-[55%] truncate">{value}</span>
                      </div>
                    ))}
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

            <div className="hidden md:flex items-center justify-end gap-6 border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
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
  );
}