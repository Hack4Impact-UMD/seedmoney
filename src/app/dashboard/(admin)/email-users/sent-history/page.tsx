
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
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

type RecipientGroup = "all" | "applicants" | "approved";

type SentEmail = {
  id: number;
  sentAt: string;
  month: string;
  subject: string;
  recipients: RecipientGroup[];
};

const groupLabels: Record<RecipientGroup, string> = {
  all: "All Users",
  applicants: "Applicants",
  approved: "Approved Campaigns",
};

// Placeholder records for the frontend only
const sampleEmails: SentEmail[] = [
  {
    id: 1,
    sentAt: "Oct 25, 2026",
    month: "2026-10",
    subject: "Your Seedmoney campaign is live!",
    recipients: ["approved"],
  },
  {
    id: 2,
    sentAt: "Oct 24, 2026",
    month: "2026-10",
    subject: "Seedmoney community update",
    recipients: ["all"],
  },
  {
    id: 3,
    sentAt: "Oct 23, 2026",
    month: "2026-10",
    subject: "Complete your campaign application",
    recipients: ["applicants"],
  },
  {
    id: 4,
    sentAt: "Oct 22, 2026",
    month: "2026-10",
    subject: "Campaign fundraising tips",
    recipients: ["approved"],
  },
  {
    id: 5,
    sentAt: "Oct 18, 2026",
    month: "2026-10",
    subject: "Important Seedmoney announcement",
    recipients: ["all"],
  },
  {
    id: 6,
    sentAt: "Oct 15, 2026",
    month: "2026-10",
    subject: "Application deadline reminder",
    recipients: ["applicants"],
  },
  {
    id: 7,
    sentAt: "Oct 11, 2026",
    month: "2026-10",
    subject: "Share your garden campaign",
    recipients: ["approved"],
  },
  {
    id: 8,
    sentAt: "Oct 7, 2026",
    month: "2026-10",
    subject: "Seedmoney program updates",
    recipients: ["all"],
  },
  {
    id: 9,
    sentAt: "Oct 2, 2026",
    month: "2026-10",
    subject: "Campaign launch checklist",
    recipients: ["approved"],
  },
  {
    id: 10,
    sentAt: "Sep 28, 2026",
    month: "2026-09",
    subject: "Thank you for joining Seedmoney",
    recipients: ["all"],
  },
  {
    id: 11,
    sentAt: "Sep 22, 2026",
    month: "2026-09",
    subject: "Application review update",
    recipients: ["applicants"],
  },
  {
    id: 12,
    sentAt: "Sep 14, 2026",
    month: "2026-09",
    subject: "September community newsletter",
    recipients: ["all", "approved"],
  },
];

export default function SentHistoryPage() {
  const [dateFilter, setDateFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("any");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter sample records by month and recipient group
  const filteredEmails = sampleEmails.filter((email) => {
    const matchesDate =
      dateFilter === "all" || email.month === dateFilter;

    const matchesGroup =
      groupFilter === "any" ||
      email.recipients.includes(groupFilter as RecipientGroup);

    return matchesDate && matchesGroup;
  });

  // Show only the records on the current page
  const visibleEmails = filteredEmails.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

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
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 2,
                  py: 0.75,
                  color: "#2F7D43",
                  borderColor: "#2F7D43",
                }}
              >
                Compose
              </Button>

              <Button
                component={Link}
                href="/dashboard/email-users/sent-history"
                variant="contained"
                size="small"
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 2,
                  py: 0.75,
                  backgroundColor: "#2F7D43",
                }}
              >
                Sent history ({sampleEmails.length})
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
                {filteredEmails.length} sample emails
              </p>
            </div>

            {/* Filters */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                select
                fullWidth
                size="small"
                label="Date"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All dates</MenuItem>
                <MenuItem value="2026-10">October 2026</MenuItem>
                <MenuItem value="2026-09">September 2026</MenuItem>
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
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="applicants">Applicants</MenuItem>
                <MenuItem value="approved">Approved Campaigns</MenuItem>
              </TextField>
            </div>

            {/* Sent history table */}
            <TableContainer>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Sent at
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Subject
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Recipients
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleEmails.map((email) => (
                    <TableRow key={email.id} hover>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          color: "#4B5563",
                        }}
                      >
                        {email.sentAt}
                      </TableCell>

                      <TableCell sx={{ color: "#1F2937" }}>
                        {email.subject}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {email.recipients.map((group) => (
                            <Chip
                              key={group}
                              label={groupLabels[group]}
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
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleEmails.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ py: 6, color: "#8E938E" }}
                      >
                        No emails match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredEmails.length}
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
            />
          </section>
        </div>
      </div>
    </div>
  );
}
