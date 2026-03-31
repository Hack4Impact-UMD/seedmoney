"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  flexRender,
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import Image from "next/image";
import DeleteUserPopUp from "@/src/components/DeleteUserPopUp";
import ApplicationStatusPopUp from "@/src/components/ApplicationStatusPopUp";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Avatar, Chip, Snackbar, Alert } from "@mui/material";
import type {
  MockUser,
  CampaignStatus,
  MockCampaign,
} from "@/src/app/dashboard/(admin)/users/mockUsersData";

interface Props {
  initialData: MockUser[];
}

type AggregateStatus = CampaignStatus | "mixed";

const STATUS_LABELS: Record<AggregateStatus, string> = {
  submitted: "Submitted",
  approved: "Approved",
  in_progress: "In Progress",
  not_started: "Not Started",
  mixed: "Mixed",
};

function getAggregateStatus(campaigns: MockCampaign[]): AggregateStatus {
  const statuses = new Set(campaigns.map((c) => c.status));
  if (statuses.size === 1) return campaigns[0].status;
  return "mixed";
}

function CampaignsSummaryBadge({
  status,
  count,
  onClick,
}: {
  status: AggregateStatus;
  count: number;
  onClick?: () => void;
}) {
  if (status === "submitted" || status === "approved") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          avatar={
            <Avatar className="bg-[#1B5E20]! text-white! font-bold! text-xs!">
              {count}
            </Avatar>
          }
          className="border-[#2E7D32]! text-[#2E7D32]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          avatar={
            <Avatar className="bg-[#01579B]! text-white! font-bold! text-xs!">
              {count}
            </Avatar>
          }
          className="border-[#0288D1]! text-[#0288D1]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  if (status === "mixed") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          avatar={
            <Avatar className="bg-[#1B5E20]! text-white! font-bold! text-xs!">
              {count}
            </Avatar>
          }
          className="border-[#2E7D32]! text-[#2E7D32]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      <Chip
        variant="outlined"
        label={STATUS_LABELS[status]}
        avatar={
          <Avatar className="bg-[#757575]! text-white! font-bold! text-xs!">
            {count}
          </Avatar>
        }
        className="border-[#BDBDBD]! text-[#BDBDBD]! font-medium! text-sm! cursor-pointer!"
      />
    </span>
  );
}

const columnHelper = createColumnHelper<MockUser>();

const UsersTable = ({ initialData }: Props) => {
  const [search, setSearch] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MockUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<MockUser | null>(null);
  const [toast, setToast] = useState(false);

  const handleConfirmDelete = useCallback(() => {
    setDeleteTarget(null);
    setToast(true);
    // TOTO: Delete user logic
  }, []);

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
        header: "Campaigns",
        cell: ({ row }) => {
          const { campaigns } = row.original;
          if (campaigns.length === 0) {
            return <span className="text-gray-400 text-sm">None</span>;
          }
          const status = getAggregateStatus(campaigns);
          return (
            <CampaignsSummaryBadge
              status={status}
              count={campaigns.length}
              onClick={() => setStatusTarget(row.original)}
            />
          );
        },
      }),
      columnHelper.display({
        id: "delete",
        header: "",
        cell: ({ row }) => (
          <span
            className="flex justify-end"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Image
              src="/icons/trash.png"
              alt="Delete"
              width={20}
              height={20}
              className="cursor-pointer"
            />
          </span>
        ),
      }),
    ],
    [],
  );

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return initialData.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter ||
        user.campaigns.some((c) => c.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, initialData]);

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
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
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
              <button
                onClick={() => setStatusFilter(pendingStatus)}
                className="text-gray-500 px-3 hover:text-gray-700 transition-colors cursor-pointer"
              >
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

      {deleteTarget && (
        <DeleteUserPopUp
          firstName={deleteTarget.first_name}
          lastName={deleteTarget.last_name}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleConfirmDelete}
        />
      )}

      {statusTarget && (
        <ApplicationStatusPopUp
          user={statusTarget}
          onClose={() => setStatusTarget(null)}
        />
      )}

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(false)}
          severity="success"
          variant="outlined"
          sx={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", color: "#1B5E20" }}
        >
          Account has been deleted!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UsersTable;
