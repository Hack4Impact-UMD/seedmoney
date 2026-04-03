"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";

interface Donor {
  id: number;
  reward: string;
  amount: number;
  name: string;
  email: string;
  card_reference: string;
  date: string;
  status: string;
}

interface DonorsTableProps {
  campaignId: number;
}

export default function DonorsTable({ campaignId }: DonorsTableProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO fetch real data from backend using campaignId
    setDonors([
      {
        id: 1001,
        reward: "Sticker Pack",
        amount: 25,
        name: "Sarah Lee",
        email: "sarahlee@example.com",
        card_reference: "1234567812345678",
        date: "2026-03-01T10:30:00",
        status: "Paid",
      },
      {
        id: 1002,
        reward: "T-Shirt",
        amount: 50,
        name: "John Smith",
        email: "johnsmith@example.com",
        card_reference: "9876543212345678",
        date: "2026-03-02T14:20:00",
        status: "Paid",
      },
      {
        id: 1003,
        reward: "Thank You Note",
        amount: 15,
        name: "Emily Chen",
        email: "emilychen@example.com",
        card_reference: "4567123412349999",
        date: "2026-03-05T09:15:00",
        status: "Pending",
      },
    ]);
  }, [campaignId]);

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
        donor.reward.toLowerCase().includes(query) ||
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
    columnHelper.accessor("reward", {
      header: "Reward",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("name", {
      header: "Contributor Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Contributor Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("card_reference", {
      header: "Card/Reference Number",
      cell: (info) => {
        const value = info.getValue();
        return `•••• •••• •••• ${value.slice(-4)}`;
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
        const isPaid = status.toLowerCase() === "paid";

        return (
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-sm font-medium",
              isPaid
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700",
            ].join(" ")}
          >
            {status}
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
        <button className="bg-[#2c7a45] text-white uppercase font-semibold px-4 py-2 rounded-md mb-7 ml-4 cursor-pointer outline-none">Export to CSV</button>
      </div>
    </div>
  );
}