"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import Button from "@mui/material/Button";
import { Avatar, Chip } from "@mui/material";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";
import type {
  UserCampaign,
  UsersTableRow,
} from "@/src/types/frontend/usersTable";
import useDeleteUser from "@/src/hooks/users/useDeleteUser";
import type { Status } from "@/src/types/db/enums";
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  initialData: UsersTableRow[];
  competitionYearMap: Map<number, number>;
  selectedYear: number;
}

type AggregateStatus = Status | "mixed";

const STATUS_LABELS: Record<AggregateStatus, string> = {
  in_progress: "In Progress",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  published: "Published",
  archived: "Archived",
  mixed: "Mixed",
};

function getAggregateStatus(campaigns: UserCampaign[]): AggregateStatus {
  const statuses = new Set(campaigns.map((c) => c.status));
  if (statuses.size === 1) return campaigns[0].status;
  return "mixed";
}

const STATUS_PRIORITY: Status[] = [
  "approved",
  "published",
  "pending",
  "in_progress",
  "denied",
  "archived",
];

function getBestStatus(campaigns: UserCampaign[]): Status {
  const statuses = new Set(campaigns.map((c) => c.status));
  return STATUS_PRIORITY.find((s) => statuses.has(s)) ?? "archived";
}

const APP_STATUS_CONFIG: Record<Status, { label: string; buttonLabel: string }> = {
  in_progress: { label: "in progress", buttonLabel: "REVIEW APPLICATION" },
  pending: { label: "pending", buttonLabel: "REVIEW APPLICATION" },
  approved: { label: "approved", buttonLabel: "VIEW CAMPAIGN" },
  denied: { label: "denied", buttonLabel: "VIEW APPLICATION" },
  published: { label: "published", buttonLabel: "VIEW CAMPAIGN" },
  archived: { label: "archived", buttonLabel: "VIEW CAMPAIGN" },
};

const APP_STATUS_ORDER: Status[] = [
  "pending",
  "approved",
  "in_progress",
  "denied",
  "published",
  "archived",
];

function groupByStatus(campaigns: UserCampaign[]) {
  const groups: Partial<Record<Status, UserCampaign[]>> = {};
  for (const campaign of campaigns) {
    if (!groups[campaign.status]) {
      groups[campaign.status] = [];
    }
    groups[campaign.status]!.push(campaign);
  }
  return groups;
}

function getCampaignStatusPath(status: Status, campaignId: number) {
  switch (status) {
    case "pending":
    case "denied":
      return `/dashboard/review-applications/${campaignId}`;
    case "approved":
    case "published":
    case "archived":
      return `/dashboard/ongoing-campaigns/${campaignId}`;
    default:
      return null;
  }
}

function CampaignsSummaryBadge({
  status,
  count,
  onClick,
  bestStatus,
}: {
  status: AggregateStatus;
  count: number;
  onClick?: () => void;
  bestStatus?: Status;
}) {
  if (status === "approved" || status === "published") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          {...(count > 1 && {
            avatar: (
              <Avatar className="bg-[#1B5E20]! text-white! font-bold! text-xs!">
                {count}
              </Avatar>
            ),
          })}
          className="border-[#2E7D32]! text-[#2E7D32]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          {...(count > 1 && {
            avatar: (
              <Avatar className="bg-[#F57F17]! text-white! font-bold! text-xs!">
                {count}
              </Avatar>
            ),
          })}
          className="border-[#F9A825]! text-[#F57F17]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  if (status === "denied") {
    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          {...(count > 1 && {
            avatar: (
              <Avatar className="bg-[#C62828]! text-white! font-bold! text-xs!">
                {count}
              </Avatar>
            ),
          })}
          className="border-[#E53935]! text-[#C62828]! font-medium! text-sm! cursor-pointer!"
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
          {...(count > 1 && {
            avatar: (
              <Avatar className="bg-[#01579B]! text-white! font-bold! text-xs!">
                {count}
              </Avatar>
            ),
          })}
          className="border-[#0288D1]! text-[#0288D1]! font-medium! text-sm! cursor-pointer!"
        />
      </span>
    );
  }

  if (status === "mixed") {
    let avatarBg = "bg-[#757575]!";
    let chipColors = "border-[#BDBDBD]! text-[#9E9E9E]!";

    if (bestStatus === "approved" || bestStatus === "published") {
      avatarBg = "bg-[#1B5E20]!";
      chipColors = "border-[#2E7D32]! text-[#2E7D32]!";
    } else if (bestStatus === "pending") {
      avatarBg = "bg-[#F57F17]!";
      chipColors = "border-[#F9A825]! text-[#F57F17]!";
    } else if (bestStatus === "in_progress") {
      avatarBg = "bg-[#01579B]!";
      chipColors = "border-[#0288D1]! text-[#0288D1]!";
    } else if (bestStatus === "denied") {
      avatarBg = "bg-[#C62828]!";
      chipColors = "border-[#E53935]! text-[#C62828]!";
    }

    return (
      <span onClick={onClick} className="cursor-pointer">
        <Chip
          variant="outlined"
          label={STATUS_LABELS[status]}
          {...(count > 1 && {
            avatar: (
              <Avatar className={`${avatarBg} text-white! font-bold! text-xs!`}>
                {count}
              </Avatar>
            ),
          })}
          className={`${chipColors} font-medium! text-sm! cursor-pointer!`}
        />
      </span>
    );
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      <Chip
        variant="outlined"
        label={STATUS_LABELS[status]}
        {...(count > 1 && {
          avatar: (
            <Avatar className="bg-[#757575]! text-white! font-bold! text-xs!">
              {count}
            </Avatar>
          ),
        })}
        className="border-[#BDBDBD]! text-[#BDBDBD]! font-medium! text-sm! cursor-pointer!"
      />
    </span>
  );
}

const columnHelper = createColumnHelper<UsersTableRow>();

export default function UsersTable({
  initialData,
  competitionYearMap,
  selectedYear,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UsersTableRow | null>(null);
  const [statusTarget, setStatusTarget] = useState<UsersTableRow | null>(null);
  const [toast, setToast] = useState(false);
  const { mutate: deleteUserMutate } = useDeleteUser();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteUserMutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setToast(true);
      },
    });
  }, [deleteTarget, deleteUserMutate]);

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
            return (
              <Chip
                variant="outlined"
                label="Not Started"
                className="border-[#BDBDBD]! text-[#9E9E9E]! font-medium! text-sm!"
              />
            );
          }
          const status = getAggregateStatus(campaigns);
          return (
            <CampaignsSummaryBadge
              status={status}
              count={campaigns.length}
              onClick={() => setStatusTarget(row.original)}
              {...(status === "mixed" && {
                bestStatus: getBestStatus(campaigns),
              })}
            />
          );
        },
      }),
      columnHelper.display({
        id: "delete",
        header: "",
        cell: ({ row }) => (
          <span
            className="flex justify-end cursor-pointer"
            onClick={() => setDeleteTarget(row.original)}
          >
            <DeleteIcon
              className="transition-opacity text-[#9E9E9E]"
              style={{ opacity: hoveredRowId === row.id ? 1 : 0 }}
            />
          </span>
        ),
      }),
    ],
    [hoveredRowId],
  );

  const yearFilteredData = useMemo(() => {
    return initialData.map((user) => ({
      ...user,
      campaigns: user.campaigns.filter((c) => {
        if (!c || !c.competition_id) return false;
        return competitionYearMap.get(c.competition_id) === selectedYear;
      }),
    }));
  }, [initialData, competitionYearMap, selectedYear]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return yearFilteredData.filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesStatus =
        !statusFilter || user.campaigns.some((c) => c.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, yearFilteredData]);

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
            {selectedYear} User List
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
                    <option value="">No Filter</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
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
                  <tr
                    key={row.id}
                    onMouseEnter={() => setHoveredRowId(row.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
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

      <BaseModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
      >
        <p className="text-gray-700 mb-8">
          You are about to delete {deleteTarget?.first_name}{" "}
          {deleteTarget?.last_name}&apos;s account. This action is irreversible.
          Are you sure you would like to delete their account?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 text-gray-600 font-medium cursor-pointer hover:text-gray-800 transition-colors"
          >
            CANCEL
          </button>
          <div className="group/del">
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 bg-gray-300 text-gray-500 font-medium rounded pointer-events-none group-hover/del:pointer-events-auto group-hover/del:bg-red-500 group-hover/del:text-white transition-colors cursor-pointer"
            >
              DELETE
            </button>
          </div>
        </div>
      </BaseModal>

      {statusTarget && (() => {
        const groups = groupByStatus(statusTarget.campaigns);
        const fullName = `${statusTarget.first_name} ${statusTarget.last_name}`;

        return (
          <BaseModal
            open={true}
            onClose={() => setStatusTarget(null)}
            title="Application Status"
          >
            <hr className="border-gray-300" />
            <div className="overflow-y-auto flex-1 max-h-[50vh]">
              {APP_STATUS_ORDER.filter((status) => groups[status]).map((status) => {
                const campaigns = groups[status]!;
                const config = APP_STATUS_CONFIG[status];

                return (
                  <div key={status}>
                    <p className="text-gray-800 mb-3 mt-4">
                      {fullName} has{" "}
                      <span className="font-bold">&lt;{campaigns.length}&gt;</span>{" "}
                      {config.label} application{campaigns.length !== 1 ? "s" : ""}
                      {status === "in_progress" ? "." : ":"}
                    </p>
                    {status !== "in_progress" && (
                      <div className="flex flex-col gap-3 pl-6">
                        {campaigns.map((campaign) => (
                          <div
                            key={campaign.campaign_id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-700">{campaign.name}</span>
                            <Button
                              variant="contained"
                              size="medium"
                              onClick={() => {
                                const path = getCampaignStatusPath(
                                  status,
                                  campaign.campaign_id,
                                );

                                if (!path) {
                                  return;
                                }

                                setStatusTarget(null);
                                router.push(path);
                              }}
                            >
                              {config.buttonLabel}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BaseModal>
        );
      })()}

      <BaseAlert
        open={toast}
        onClose={() => setToast(false)}
        title="Account has been deleted!"
      />
    </div>
  );
};
