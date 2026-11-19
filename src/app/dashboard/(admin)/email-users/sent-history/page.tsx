
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { useEmailHistory, useEmailHistoryMonths } from "@/src/hooks/email/useEmailHistory";
import { ADMIN_EMAIL_GROUP_LABELS } from "@/src/types/db/adminEmails";
import { EMAIL_HISTORY_LABELS } from "@/src/types/emailHistory";
import { formatHistoryDate } from "@/src/lib/emailHistory";
import EmailHistoryModal from "@/src/components/email/EmailHistoryModal";
import {
  Button,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";

// "2026-10" -> "October 2026"
function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function SentHistoryPage() {
  const [dateFilter, setDateFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("any");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const history = useEmailHistory({ page, pageSize: rowsPerPage, month: dateFilter, group: groupFilter });
  const dates = useEmailHistoryMonths();
  const visibleEmails = history.data?.emails ?? [];
  const total = history.data?.total ?? 0;
  const months = dates.data ?? [];

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="min-w-0 flex-1 bg-[#F6FAF9] px-4 py-8 pb-24 md:px-10 md:py-[60px]">
        <div className="flex w-full flex-col gap-6">

          {/* Page heading and navigation */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#123A1E]">
                Email Users
              </h1>

              <p className="mt-2 text-gray-600">
                Send an update to a group of Seedmoney users.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                component={Link}
                href="/dashboard/email-users"
                variant="outlined"
                size="small"
              >
                Compose
              </Button>

              <Button
                component={Link}
                href="/dashboard/email-users/sent-history"
                variant="contained"
                size="small"
              >
                Sent history
              </Button>
            </div>
          </div>

          {/* Sent emails section */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#123A1E]">
                Sent emails
              </h2>

              <p className="text-sm text-[#8E938E]">
                {history.isPending ? "Loading..." : history.isError ? "History unavailable" : `${total} ${total === 1 ? "email" : "emails"}`}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                select
                fullWidth
                size="small"
                label="Date (UTC)"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All dates</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {formatMonth(month)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                label="Recipient groups"
                value={groupFilter}
                onChange={(event) => {
                  setGroupFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="any">All groups</MenuItem>
                {Object.entries(ADMIN_EMAIL_GROUP_LABELS).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
              </TextField>
            </div>

            {history.isError && <div role="alert" className="mb-4 text-red-700">
              {history.error.message} <Button onClick={() => void history.refetch()}>Retry</Button>
            </div>}
            {dates.isError && <div role="alert" className="mb-4 text-red-700">
              {dates.error.message} <Button onClick={() => void dates.refetch()}>Retry date filters</Button>
            </div>}
            {history.isPending && <p role="status">Loading sent history...</p>}
            {history.isFetching && !history.isPending && <p role="status">Refreshing...</p>}
            {!history.isError && !history.isPending && page > 0 && page * rowsPerPage >= total &&
              <Button onClick={() => setPage(0)}>Return to first page</Button>}

            {/* Sent history table */}
            <TableContainer>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Completed at (UTC)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Subject
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Recipients
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!history.isError && visibleEmails.map((email) => (
                    <TableRow key={email.id} hover>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          color: "#4B5563",
                        }}
                      >
                        {formatHistoryDate(email.completed_at)}
                      </TableCell>

                      <TableCell sx={{ color: "#1F2937" }}>
                        <Button variant="text" onClick={() => setSelectedId(email.id)} sx={{ textTransform: "none", textAlign: "left", overflowWrap: "anywhere" }}>
                          {email.subject}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {email.recipient_groups.map((group) => (
                            <Chip
                              key={group}
                              label={ADMIN_EMAIL_GROUP_LABELS[group] ?? group}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#C4D8C9",
                                color: "#2F7D43",
                                backgroundColor: "#F6FAF7",
                              }}
                            />
                          ))}
                        </div>
                        <span>{email.admin_email_recipients[0]?.count ?? 0} recipients</span>
                      </TableCell>
                      <TableCell>{EMAIL_HISTORY_LABELS[email.status] ?? email.status}</TableCell>
                    </TableRow>
                  ))}

                  {!history.isPending && !history.isError && visibleEmails.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ py: 6, color: "#8E938E" }}
                      >
                        {dateFilter === "all" && groupFilter === "any"
                          ? "No emails have been sent yet."
                          : "No emails match the selected filters."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!history.isPending && !history.isError && (page === 0 || page * rowsPerPage < total) && <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              sx={{
                borderTop: "1px solid #E5E7EB",
                color: "#6B7280",
              }}
            />}
          </section>
        </div>
      </div>
      <EmailHistoryModal id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
