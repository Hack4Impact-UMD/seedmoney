"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import { readEmailAudienceRecipients } from "@/src/actions/email/recipients";
import type { AdminEmailGroup } from "@/src/types/db/adminEmails";

// Long lists stay quick to render; search narrows down to the rest
const MAX_VISIBLE = 200;

interface EmailRecipientsModalProps {
  open: boolean;
  onClose: () => void;
  groups: AdminEmailGroup[];
}

export default function EmailRecipientsModal({
  open,
  onClose,
  groups,
}: EmailRecipientsModalProps) {
  const [search, setSearch] = useState("");
  const selection = [...new Set(groups)].sort();
  const recipients = useQuery({
    queryKey: ["admin-emails", "audience-recipients", selection],
    queryFn: async () => {
      const result = await readEmailAudienceRecipients(selection);
      if (!result.success) throw new Error(result.error);
      return result.recipients;
    },
    enabled: open && selection.length > 0,
    staleTime: 0,
    retry: 1,
  });

  const query = search.trim().toLowerCase();
  const matches = (recipients.data ?? []).filter(
    ({ email, firstName }) =>
      !query ||
      email.toLowerCase().includes(query) ||
      firstName.toLowerCase().includes(query),
  );

  return (
    <BaseModal open={open} onClose={onClose} title="Recipients">
      <div className="flex min-h-0 flex-col gap-3">
        {recipients.isPending ? (
          <p className="text-sm text-gray-500">Loading recipients...</p>
        ) : recipients.isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-700">
            <p>{recipients.error.message}</p>
            <Button size="small" onClick={() => recipients.refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {recipients.data.length.toLocaleString()}{" "}
              {recipients.data.length === 1 ? "recipient" : "recipients"} will get this email
            </p>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search recipients"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2D7A45]"
            />

            <ul className="max-h-[45vh] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
              {matches.slice(0, MAX_VISIBLE).map(({ email, firstName }) => (
                <li key={email} className="px-3 py-2">
                  {firstName && (
                    <p className="text-sm font-semibold text-[#1f2320]">{firstName}</p>
                  )}
                  <p className="break-all text-sm text-gray-600">{email}</p>
                </li>
              ))}
              {matches.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  No recipients match your search.
                </li>
              )}
            </ul>

            {matches.length > MAX_VISIBLE && (
              <p className="text-xs text-gray-500">
                Showing the first {MAX_VISIBLE} of {matches.length.toLocaleString()}. Search to find someone specific.
              </p>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button variant="contained" size="small" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
