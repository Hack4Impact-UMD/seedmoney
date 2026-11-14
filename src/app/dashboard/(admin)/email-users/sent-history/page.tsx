"use client";

import { useEffect, useState } from "react";
import Navbar from "@/src/components/Navbar";
import {
  Button,
  Chip,
  Menu,
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
import CheckIcon from "@mui/icons-material/Check";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import EmailStatusToast from "@/src/components/email/EmailStatusToast";
import EmailUsersHeader from "@/src/components/email/EmailUsersHeader";
import useSentEmails from "@/src/hooks/email/useSentEmails";
import { EMAIL_SENT_FLAG } from "@/src/constants/emailConstants";
import {
  ADMIN_EMAIL_GROUP_LABELS,
  type AdminEmailGroup,
} from "@/src/types/db/adminEmails";

type SortOrder = "newest" | "oldest";

const groupLabels = ADMIN_EMAIL_GROUP_LABELS;
const GROUP_FILTERS: { value: "any" | AdminEmailGroup; label: string }[] = [
  { value: "any", label: "All groups" },
  ...Object.entries(groupLabels).map(([value, label]) => ({
    value: value as AdminEmailGroup,
    label,
  })),
];
const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

// "2026-10" for the month filter, in the admin's own time zone
function monthKey(sentAt: string) {
  const date = new Date(sentAt);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// "2026-10" -> "October 2026"
function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// "10/20/2026"
function formatDate(sentAt: string) {
  return new Date(sentAt).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(sentAt: string) {
  return new Date(sentAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ICON_BUTTON =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600";

export default function SentHistoryPage() {
  const history = useSentEmails();
  const sentEmails = history.data ?? [];

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState<"any" | AdminEmailGroup>("any");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  // The compose page leaves a flag behind when a send finishes
  const [sentAlertOpen, setSentAlertOpen] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(EMAIL_SENT_FLAG) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try { sessionStorage.removeItem(EMAIL_SENT_FLAG); } catch { /* Nothing to clear. */ }
  }, []);

  // Months that have at least one sent email, newest first
  const months = [...new Set(sentEmails.map((email) => monthKey(email.sentAt)))]
    .sort()
    .reverse();

  const query = search.trim().toLowerCase();
  const filteredEmails = sentEmails
    .filter((email) => {
      const matchesDate =
        dateFilter === "all" || monthKey(email.sentAt) === dateFilter;
      const matchesGroup =
        groupFilter === "any" || email.recipientGroups.includes(groupFilter);
      const matchesSearch =
        !query ||
        email.subject.toLowerCase().includes(query) ||
        email.recipientGroups.some((group) =>
          groupLabels[group].toLowerCase().includes(query),
        );

      return matchesDate && matchesGroup && matchesSearch;
    })
    .sort((a, b) =>
      sortOrder === "newest"
        ? b.sentAt.localeCompare(a.sentAt)
        : a.sentAt.localeCompare(b.sentAt),
    );

  // Show only the records on the current page
  const pageCount = Math.max(1, Math.ceil(filteredEmails.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleEmails = filteredEmails.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage,
  );

  const emptyMessage = history.isPending
    ? "Loading sent emails..."
    : sentEmails.length === 0
      ? "No emails have been sent yet."
      : "No emails match your search or filters.";

  const countLabel = `${filteredEmails.length.toLocaleString()} ${
    filteredEmails.length === 1 ? "Email" : "Emails"
  }`;

  const pager = (
    <div className="flex items-center justify-center gap-3 text-sm text-[#666666]">
      <span>Viewing Page</span>
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => setPage(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
        className="cursor-pointer text-[#667085] disabled:cursor-default disabled:opacity-30"
      >
        <KeyboardArrowLeftIcon />
      </button>
      <span className="flex h-10 min-w-[56px] items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[#212121]">
        {currentPage + 1}
      </span>
      <button
        type="button"
        aria-label="Next page"
        onClick={() => setPage(Math.min(currentPage + 1, pageCount - 1))}
        disabled={currentPage >= pageCount - 1}
        className="cursor-pointer text-[#667085] disabled:cursor-default disabled:opacity-30"
      >
        <KeyboardArrowRightIcon />
      </button>
      <span>of {pageCount}</span>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="min-w-0 flex-1 bg-[#F6FAF9] px-4 py-8 pb-24 md:px-10 md:py-[60px]">
        <div className="flex w-full flex-col gap-4 md:gap-6">
          <EmailUsersHeader
            active="history"
            subtitle="Every email sent to a group of users, newest first."
            sentCount={history.data?.length}
          />

          {history.isError && (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{history.error.message}</p>
              <Button size="small" onClick={() => history.refetch()}>Retry</Button>
            </div>
          )}

          {/* Sent emails section: a plain list on phones, a white card on desktop */}
          <section className="md:rounded-xl md:border md:border-gray-200 md:bg-white md:p-6">
            <p className="text-sm font-bold text-[#123A1E] md:hidden">
              Sent Emails · {countLabel}
            </p>

            <div className="mb-5 max-md:hidden">
              <h2 className="text-lg font-semibold text-[#123A1E]">
                Sent emails
              </h2>

              <p className="text-sm text-[#8E938E]">
                {countLabel.toLowerCase()}
              </p>
            </div>

            {/* Phone controls: search, filter by group, sort by date */}
            <div className="mt-3 flex items-center gap-2 md:hidden">
              <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-[#2D7A45]">
                <SearchIcon className="text-gray-500" sx={{ fontSize: 20 }} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Search"
                  aria-label="Search sent emails"
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                />
              </label>

              <button
                type="button"
                aria-label="Filter by recipient group"
                aria-haspopup="menu"
                onClick={(event) => setFilterAnchorEl(event.currentTarget)}
                className={`${ICON_BUTTON} ${groupFilter !== "any" ? "border-[#2D7A45]! text-[#2D7A45]!" : ""}`}
              >
                <FilterAltOutlinedIcon sx={{ fontSize: 22 }} />
              </button>

              <button
                type="button"
                aria-label="Sort sent emails"
                aria-haspopup="menu"
                onClick={(event) => setSortAnchorEl(event.currentTarget)}
                className={ICON_BUTTON}
              >
                <ImportExportIcon sx={{ fontSize: 22 }} />
              </button>
            </div>

            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {GROUP_FILTERS.map(({ value, label }) => (
                <MenuItem
                  key={value}
                  onClick={() => {
                    setGroupFilter(value);
                    setPage(0);
                    setFilterAnchorEl(null);
                  }}
                  sx={{ fontSize: 14, gap: 2, justifyContent: "space-between" }}
                >
                  {label}
                  {groupFilter === value && <CheckIcon sx={{ fontSize: 18, color: "#2D7A45" }} />}
                </MenuItem>
              ))}
            </Menu>

            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={() => setSortAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <MenuItem
                  key={value}
                  onClick={() => {
                    setSortOrder(value);
                    setPage(0);
                    setSortAnchorEl(null);
                  }}
                  sx={{ fontSize: 14, gap: 2, justifyContent: "space-between" }}
                >
                  {label}
                  {sortOrder === value && <CheckIcon sx={{ fontSize: 18, color: "#2D7A45" }} />}
                </MenuItem>
              ))}
            </Menu>

            {/* Phone list */}
            <div className="md:hidden">
              <hr className="my-4 border-gray-300" />

              {visibleEmails.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#8E938E]">
                  {emptyMessage}
                </p>
              ) : (
                <>
                  <div className="mb-4">{pager}</div>

                  <ul className="flex flex-col gap-3">
                    {visibleEmails.map((email) => (
                      <li
                        key={email.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <div className="border-b border-gray-200 px-4 py-3">
                          <p className="text-xs text-gray-500">Date Sent:</p>
                          <p className="font-bold text-[#1f2320]">
                            {formatDate(email.sentAt)}
                          </p>
                        </div>

                        <div className="flex items-start justify-between gap-4 px-4 py-3">
                          <span className="shrink-0 text-xs text-gray-500">Subject</span>
                          <span className="w-[55%] break-words text-sm text-[#1f2320]">
                            {email.subject}
                            {email.status === "partially_failed" && (
                              <span className="mt-1 block text-xs text-amber-800">
                                Some recipients failed
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="mx-4 border-t border-gray-100" />

                        <div className="flex items-start justify-between gap-4 px-4 py-3">
                          <span className="shrink-0 text-xs text-gray-500">Recipients</span>
                          <span className="w-[55%] break-words text-sm text-[#1f2320]">
                            {email.recipientGroups
                              .map((group) => groupLabels[group] ?? group)
                              .join(", ")}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">{pager}</div>
                </>
              )}
            </div>

            {/* Desktop filters */}
            <div className="mb-5 grid grid-cols-2 gap-4 max-md:hidden">
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
                  setGroupFilter(event.target.value as "any" | AdminEmailGroup);
                  setPage(0);
                }}
              >
                {GROUP_FILTERS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {/* Desktop table */}
            <div className="max-md:hidden">
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
                          {formatDateTime(email.sentAt)}
                        </TableCell>

                        <TableCell sx={{ color: "#1F2937" }}>
                          {email.subject}
                          {email.status === "partially_failed" && (
                            <span className="mt-1 block text-xs text-amber-800">
                              Some recipients failed
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {email.recipientGroups.map((group) => (
                              <Chip
                                key={group}
                                label={groupLabels[group] ?? group}
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
                          {emptyMessage}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredEmails.length}
                page={currentPage}
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
            </div>
          </section>

          <EmailStatusToast
            open={sentAlertOpen}
            onClose={() => setSentAlertOpen(false)}
            severity="success"
            title="Email sent!"
          />
        </div>
      </div>
    </div>
  );
}
