"use client";
import React, { useMemo, useState } from "react";
import {
  flexRender,
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Avatar, Chip } from "@mui/material";
import type {
  MockUser,
  ApplicationStatus,
} from "@/src/app/dashboard/(admin)/users/mockUsersData";

interface Props {
  initialData: MockUser[];
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  approved: "Approved",
  mixed: "Mixed",
  in_progress: "In Progress",
  not_started: "Not Started",
};

// chooses which badge to show under application status
function ApplicationStatusBadge({
  status,
  count,
}: {
  status: ApplicationStatus;
  count: number;
}) {
  if (status === "submitted" || status === "approved" || status === "mixed") {
    return (
      <Chip
        variant="outlined"
        label={STATUS_LABELS[status]}
        avatar={
          <Avatar className="bg-[#1B5E20]! text-white! font-bold! text-xs!">
            {count}
          </Avatar>
        }
        className="border-[#2E7D32]! text-[#2E7D32]! font-medium! text-sm!"
      />
    );
  }

  if (status === "in_progress") {
    return (
      <Chip
        variant="outlined"
        label={STATUS_LABELS[status]}
        className="border-[#0288D1]! text-[#0288D1]! font-medium text-sm!"
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      label={STATUS_LABELS[status]}
      className="border-[#BDBDBD]! text-[#BDBDBD]! font-medium! text-sm!"
    />
  );
}

const columnHelper = createColumnHelper<MockUser>();

const columns = [
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
  columnHelper.accessor(
    (row) => ({ status: row.application_status, count: row.campaign_count }),
    {
      id: "application_status",
      header: "Application Status",
      cell: (info) => (
        <ApplicationStatusBadge
          status={info.getValue().status}
          count={info.getValue().count}
        />
      ),
    },
  ),
  columnHelper.display({
    id: "delete",
    header: "",
    cell: () => (
      <span className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
        <DeleteIcon className="cursor-pointer text-red-500" fontSize="small" />
      </span>
    ),
  }),
];

const UsersTable = ({ initialData }: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return initialData.filter(
      (user) =>
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    );
  }, [search, initialData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="w-full">
      <div className="md:w-full md:mx-auto bg-white rounded-xl overflow-x-auto">
        {/* Header */}
        <div className="pt-8 px-5">
          <h2 className="text-black sm:text-left text-center">
            2026 User List
          </h2>
          <p className="text-sm text-gray-500 sm:text-left text-center">
            {initialData.length} Users
          </p>

          {/* Search + Filter row */}
          <div className="flex gap-4 my-6">
            <div className="relative flex-1">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-00">
                Search
              </label>
              <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2.5 focus-within:border-blue-500 transition-colors">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, etc..."
                  className="w-full bg-transparent outline-none text-md"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
                  Filter By Application Status
                </label>
                <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-transparent outline-none text-md text-gray-500 cursor-pointer appearance-none"
                  >
                    <option value="">Application Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="not_started">Not Started</option>
                  </select>
                </div>
              </div>
              <button className="text-gray-500 px-3 hover:text-gray-700 transition-colors cursor-pointer">
                <FilterAltIcon />
              </button>
            </div>
          </div>
        </div>

        {filteredData.length === 0 ? (
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
                        className="text-left px-5 py-4 border-b border-gray-300 font-semibold text-gray-800"
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
                  <tr key={row.id} className="group">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="text-left px-5 py-4 border-b border-gray-300"
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

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-end gap-6 text-sm text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="outline-none cursor-pointer font-medium text-gray-700"
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
                  className="p-1 disabled:opacity-30 text-2xl text-black font-bold"
                >
                  &lt;
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1 disabled:opacity-30 text-2xl text-black font-bold"
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
};

export default UsersTable;
